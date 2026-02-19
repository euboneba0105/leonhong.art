import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/adminCheck'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function POST(req: NextRequest) {
  const { error } = await requireAdmin()
  if (error) return error
  if (!supabaseAdmin) return NextResponse.json({ error: 'DB not configured' }, { status: 500 })

  const { folder = 'artworks', ext = 'jpg' } = await req.json()
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  const filePath = `${folder}/${fileName}`

  const { data, error: signError } = await supabaseAdmin.storage
    .from('images')
    .createSignedUploadUrl(filePath)

  if (signError) return NextResponse.json({ error: signError.message }, { status: 500 })

  const { data: urlData } = supabaseAdmin.storage
    .from('images')
    .getPublicUrl(filePath)

  return NextResponse.json({
    signedUrl: data.signedUrl,
    token: data.token,
    path: filePath,
    publicUrl: urlData.publicUrl,
  })
}
