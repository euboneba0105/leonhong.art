/**
 * Upload a file directly to Supabase storage via signed URL.
 * This bypasses the Next.js API route body size limit so large files (up to 50 MB) work.
 */
export async function uploadFile(file: File, folder = 'artworks'): Promise<string> {
  const MAX_SIZE = 50 * 1024 * 1024 // 50 MB
  if (file.size > MAX_SIZE) throw new Error('檔案大小超過 50MB 限制')

  const ext = file.name.split('.').pop() || 'jpg'

  // 1. Get a signed upload URL from our API (small JSON request)
  const urlRes = await fetch('/api/upload-url', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ folder, ext }),
  })
  if (!urlRes.ok) {
    const err = await urlRes.json().catch(() => null)
    throw new Error(err?.error || '取得上傳網址失敗')
  }
  const { signedUrl, publicUrl } = await urlRes.json()

  // 2. Upload the file directly to Supabase (bypasses server body limits)
  const uploadRes = await fetch(signedUrl, {
    method: 'PUT',
    headers: { 'Content-Type': file.type },
    body: file,
  })
  if (!uploadRes.ok) throw new Error('檔案上傳失敗')

  return publicUrl
}
