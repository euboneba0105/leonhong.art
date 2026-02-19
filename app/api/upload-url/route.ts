import { NextRequest, NextResponse } from 'next/server'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { requireAdmin } from '@/lib/adminCheck'
import { r2Client, R2_BUCKET, R2_PUBLIC_URL } from '@/lib/r2Client'

export async function POST(req: NextRequest) {
  const { error } = await requireAdmin()
  if (error) return error
  if (!r2Client) return NextResponse.json({ error: 'R2 not configured' }, { status: 500 })

  const { folder = 'artworks', ext = 'jpg', contentType = 'image/jpeg' } = await req.json()
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  const key = `${folder}/${fileName}`

  const command = new PutObjectCommand({
    Bucket: R2_BUCKET,
    Key: key,
    ContentType: contentType,
  })

  const signedUrl = await getSignedUrl(r2Client, command, { expiresIn: 600 })
  const publicUrl = `${R2_PUBLIC_URL}/${key}`

  return NextResponse.json({ signedUrl, publicUrl })
}
