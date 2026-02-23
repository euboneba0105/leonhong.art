import { NextRequest, NextResponse } from 'next/server'
import { DeleteObjectCommand } from '@aws-sdk/client-s3'
import { requireAdmin } from '@/lib/adminCheck'
import { r2Client, R2_BUCKET, R2_PUBLIC_URL } from '@/lib/r2Client'

/**
 * 刪除 R2 上已上傳的檔案（用於儲存失敗或更換照片時清理孤兒檔）
 * Body: { url: string } — 必須為目前 R2 的 public URL
 */
export async function POST(req: NextRequest) {
  try {
    const { error } = await requireAdmin()
    if (error) return error
    if (!r2Client) return NextResponse.json({ error: 'R2 not configured' }, { status: 500 })

    const body = await req.json()
    const url = typeof body?.url === 'string' ? body.url.trim() : ''
    if (!url) return NextResponse.json({ error: 'Missing url' }, { status: 400 })

    const baseUrl = R2_PUBLIC_URL.replace(/\/+$/, '')
    if (!url.startsWith(baseUrl + '/'))
      return NextResponse.json({ error: 'Invalid R2 URL' }, { status: 400 })

    const key = url.slice(baseUrl.length).replace(/^\/+/, '')
    if (!key) return NextResponse.json({ error: 'Invalid key' }, { status: 400 })

    await r2Client.send(new DeleteObjectCommand({ Bucket: R2_BUCKET, Key: key }))
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    console.error('POST /api/delete-r2 error:', err)
    return NextResponse.json({ error: err.message || 'Delete failed' }, { status: 500 })
  }
}
