/**
 * Upload a file to Cloudflare R2 via our server-side API.
 * The file goes: client → our API → R2 (server-side).
 * This avoids CORS issues with direct browser-to-R2 uploads.
 */
export async function uploadFile(file: File, folder = 'artworks'): Promise<string> {
  const MAX_SIZE = 50 * 1024 * 1024 // 50 MB
  if (file.size > MAX_SIZE) throw new Error('檔案大小超過 50MB 限制')

  const formData = new FormData()
  formData.append('file', file)
  formData.append('folder', folder)

  const res = await fetch('/api/upload-url', {
    method: 'POST',
    body: formData,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => null)
    throw new Error(err?.error || `上傳失敗 (${res.status})`)
  }

  const { url } = await res.json()
  return url
}
