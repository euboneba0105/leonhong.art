import { NextRequest, NextResponse } from 'next/server'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { requireAdmin } from '@/lib/adminCheck'
import { r2Client, R2_BUCKET, R2_PUBLIC_URL } from '@/lib/r2Client'

export const runtime = 'nodejs'

/**
 * Returns a presigned PUT URL so the browser can upload directly to R2,
 * bypassing Vercel's 4.5 MB body-size limit entirely.
 */
export async function POST(req: NextRequest) {
  try {
    const { error } = await requireAdmin()
    if (error) return error
    if (!r2Client) return NextResponse.json({ error: 'R2 not configured' }, { status: 500 })

    const { filename, contentType, folder = 'artworks' } = await req.json()
    if (!filename || !contentType) {
      return NextResponse.json({ error: 'Missing filename or contentType' }, { status: 400 })
    }

    const ext = filename.split('.').pop() || 'jpg'
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const key = `${folder}/${fileName}`

    const uploadUrl = await getSignedUrl(
      r2Client,
      new PutObjectCommand({
        Bucket: R2_BUCKET,
        Key: key,
        ContentType: contentType,
      }),
      { expiresIn: 600 } // 10 minutes
    )

    const baseUrl = R2_PUBLIC_URL.replace(/\/+$/, '')
    const publicUrl = `${baseUrl}/${key}`

    return NextResponse.json({ uploadUrl, publicUrl })
  } catch (err: any) {
    console.error('POST /api/upload-url error:', err)
    return NextResponse.json({ error: err.message || 'Failed to generate upload URL' }, { status: 500 })
  }
}
