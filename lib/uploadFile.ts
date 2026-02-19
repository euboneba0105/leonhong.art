/**
 * Upload a file to Cloudflare R2 using a presigned URL.
 * Flow: client gets presigned URL from our API → client PUTs directly to R2.
 * This bypasses Vercel's 4.5 MB body-size limit.
 */
export async function uploadFile(file: File, folder = 'artworks'): Promise<string> {
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

  // Step 2: Upload directly to R2 (bypasses Vercel entirely)
  const uploadRes = await fetch(uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': file.type },
    body: file,
  })

  if (!uploadRes.ok) {
    throw new Error(`上傳失敗 (${uploadRes.status})`)
  }

  return publicUrl
}
