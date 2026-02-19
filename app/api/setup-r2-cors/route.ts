import { NextResponse } from 'next/server'
import { PutBucketCorsCommand } from '@aws-sdk/client-s3'
import { requireAdmin } from '@/lib/adminCheck'
import { r2Client, R2_BUCKET } from '@/lib/r2Client'

export const runtime = 'nodejs'

/**
 * One-time setup: configure CORS on the R2 bucket so browsers can
 * upload directly via presigned URLs.
 *
 * Call once: POST /api/setup-r2-cors (as admin)
 */
export async function POST() {
  const { error } = await requireAdmin()
  if (error) return error
  if (!r2Client) return NextResponse.json({ error: 'R2 not configured' }, { status: 500 })

  try {
    await r2Client.send(new PutBucketCorsCommand({
      Bucket: R2_BUCKET,
      CORSConfiguration: {
        CORSRules: [{
          AllowedOrigins: ['*'],
          AllowedMethods: ['PUT', 'GET', 'HEAD'],
          AllowedHeaders: ['*'],
          MaxAgeSeconds: 86400,
        }],
      },
    }))

    return NextResponse.json({ ok: true, message: 'R2 CORS configured successfully' })
  } catch (err: any) {
    console.error('Setup R2 CORS error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
