import { NextRequest, NextResponse } from 'next/server'
import { HeadObjectCommand } from '@aws-sdk/client-s3'
import { requireAdmin } from '@/lib/adminCheck'
import { r2Client, R2_BUCKET, R2_PUBLIC_URL } from '@/lib/r2Client'

export const runtime = 'nodejs'

/**
 * After the client PUTs a file to R2 via presigned URL, call this to verify
 * the object exists and has content. Only then should we save the URL to DB.
 * Reduces "record created but file missing" due to timing or network issues.
 */
export async function POST(req: NextRequest) {
  try {
    const { error } = await requireAdmin()
    if (error) return error
    if (!r2Client || !R2_BUCKET || !R2_PUBLIC_URL) {
      return NextResponse.json({ error: 'R2 not configured' }, { status: 500 })
    }

    const { publicUrl } = await req.json()
    if (!publicUrl || typeof publicUrl !== 'string') {
      return NextResponse.json({ error: 'Missing publicUrl' }, { status: 400 })
    }

    const base = R2_PUBLIC_URL.replace(/\/+$/, '')
    if (!publicUrl.startsWith(base + '/') && !publicUrl.startsWith(base)) {
      return NextResponse.json({ error: 'Invalid publicUrl for this bucket' }, { status: 400 })
    }

    const key = publicUrl.slice(base.length).replace(/^\//, '')

    const head = await r2Client.send(
      new HeadObjectCommand({
        Bucket: R2_BUCKET,
        Key: key,
      }),
    )

    const size = head.ContentLength ?? 0
    if (size <= 0) {
      return NextResponse.json(
        { error: 'Object exists but has no content (size 0)' },
        { status: 422 },
      )
    }

    return NextResponse.json({ ok: true, size })
  } catch (err: any) {
    if (err.name === 'NotFound' || err.$metadata?.httpStatusCode === 404) {
      return NextResponse.json({ error: 'Object not found in storage' }, { status: 404 })
    }
    console.error('POST /api/upload-verify error:', err)
    return NextResponse.json(
      { error: err.message || 'Verification failed' },
      { status: 500 },
    )
  }
}
