const VERIFY_MAX_ATTEMPTS = 5
const VERIFY_DELAY_MS = 800

/**
 * Upload a file to Cloudflare R2 using a presigned URL.
 * Flow: client gets presigned URL from our API → client PUTs directly to R2
 * → verify object exists on R2 (with retries for eventual consistency) → return publicUrl.
 * This bypasses Vercel's 4.5 MB body-size limit and reduces "record saved but file missing".
 */
export async function uploadFile(
  file: File,
  folder = 'artworks',
  onProgress?: (percent: number) => void,
): Promise<string> {
  const MAX_SIZE = 50 * 1024 * 1024 // 50 MB
  if (file.size > MAX_SIZE) throw new Error('檔案大小超過 50MB 限制')

  // Step 1: Get presigned URL from our API (tiny JSON request)
  const presignRes = await fetch('/api/upload-url', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      filename: file.name,
      contentType: file.type,
      folder,
    }),
  })

  if (!presignRes.ok) {
    const err = await presignRes.json().catch(() => null)
    throw new Error(err?.error || `取得上傳網址失敗 (${presignRes.status})`)
  }

  const { uploadUrl, publicUrl } = await presignRes.json()

  // Step 2: Upload directly to R2 using XHR for progress tracking
  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest()

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100))
      }
    })

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve()
      } else {
        reject(new Error(`上傳失敗 (${xhr.status})`))
      }
    })

    xhr.addEventListener('error', () => reject(new Error('上傳失敗（網路錯誤）')))

    xhr.open('PUT', uploadUrl)
    xhr.setRequestHeader('Content-Type', file.type)
    xhr.send(file)
  })

  // Step 3: Verify object exists on R2 before returning URL (retry for eventual consistency)
  let lastError: string | null = null
  for (let attempt = 1; attempt <= VERIFY_MAX_ATTEMPTS; attempt++) {
    const verifyRes = await fetch('/api/upload-verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ publicUrl }),
    })
    if (verifyRes.ok) return publicUrl
    const body = await verifyRes.json().catch(() => ({}))
    lastError = body?.error || `驗證失敗 (${verifyRes.status})`
    if (attempt < VERIFY_MAX_ATTEMPTS) {
      await new Promise((r) => setTimeout(r, VERIFY_DELAY_MS))
    }
  }
  throw new Error(lastError || '圖片已上傳但無法確認已寫入，請再試一次')
}
