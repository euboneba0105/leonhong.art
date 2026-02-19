import { NextRequest, NextResponse } from 'next/server'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { requireAdmin } from '@/lib/adminCheck'
import { r2Client, R2_BUCKET, R2_PUBLIC_URL } from '@/lib/r2Client'

export const runtime = 'nodejs'
export const maxDuration = 60

export async function POST(req: NextRequest) {
  try {
    const { error } = await requireAdmin()
    if (error) return error
    if (!r2Client) return NextResponse.json({ error: 'R2 not configured' }, { status: 500 })

    const formData = await req.formData()
    const file = formData.get('file') as File | null
    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

    const MAX_SIZE = 50 * 1024 * 1024
    if (file.size > MAX_SIZE) return NextResponse.json({ error: '檔案大小超過 50MB 限制' }, { status: 413 })

    const folder = (formData.get('folder') as string) || 'artworks'
    const ext = file.name.split('.').pop() || 'jpg'
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const key = `${folder}/${fileName}`

    const arrayBuffer = await file.arrayBuffer()

    await r2Client.send(new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
      Body: Buffer.from(arrayBuffer),
      ContentType: file.type,
    }))

    const publicUrl = `${R2_PUBLIC_URL}/${key}`
    return NextResponse.json({ url: publicUrl })
  } catch (err: any) {
    console.error('POST /api/upload-url error:', err)
    return NextResponse.json({ error: err.message || 'Upload failed' }, { status: 500 })
  }
}
