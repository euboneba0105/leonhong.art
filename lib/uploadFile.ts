/**
 * Upload a file directly to Cloudflare R2 via presigned URL.
 * Flow: client → our API (get presigned URL) → client → R2 (upload file directly).
 * This bypasses all server body size limits — supports up to 50 MB.
 */
export async function uploadFile(file: File, folder = 'artworks'): Promise<string> {
  const MAX_SIZE = 50 * 1024 * 1024 // 50 MB
  if (file.size > MAX_SIZE) throw new Error('檔案大小超過 50MB 限制')

  const ext = file.name.split('.').pop() || 'jpg'

  // 1. Get a presigned upload URL from our API (small JSON request)
  let urlRes: Response
  try {
    urlRes = await fetch('/api/upload-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ folder, ext, contentType: file.type }),
    })
  } catch (e: any) {
    throw new Error(`[步驟1] 無法取得上傳網址: ${e.message}`)
  }
  if (!urlRes.ok) {
    const err = await urlRes.json().catch(() => null)
    throw new Error(`[步驟1] 取得上傳網址失敗 (${urlRes.status}): ${err?.error || '未知錯誤'}`)
  }
  const { signedUrl, publicUrl } = await urlRes.json()

  // 2. Upload the file directly to R2 (bypasses server body limits)
  let uploadRes: Response
  try {
    uploadRes = await fetch(signedUrl, {
      method: 'PUT',
      headers: { 'Content-Type': file.type },
      body: file,
    })
  } catch (e: any) {
    throw new Error(`[步驟2] 上傳到R2失敗: ${e.message}`)
  }
  if (!uploadRes.ok) throw new Error(`[步驟2] R2回傳錯誤 (${uploadRes.status})`)

  return publicUrl
}
