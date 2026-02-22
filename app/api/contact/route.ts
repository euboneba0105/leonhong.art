import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { ADMIN_EMAILS } from '@/lib/auth'

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM_EMAIL = process.env.RESEND_FROM ?? 'Leon Hong Art <onboarding@resend.dev>'
const MAX_MESSAGE_LENGTH = 5000
const MAX_NAME_LENGTH = 100

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
}

export async function POST(req: NextRequest) {
  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json(
      { error: 'Email service is not configured' },
      { status: 503 }
    )
  }

  try {
    const body = await req.json()
    const name = typeof body.name === 'string' ? body.name.trim() : ''
    const email = typeof body.email === 'string' ? body.email.trim() : ''
    const message = typeof body.message === 'string' ? body.message.trim() : ''

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      )
    }
    if (name.length > MAX_NAME_LENGTH) {
      return NextResponse.json(
        { error: `Name must be at most ${MAX_NAME_LENGTH} characters` },
        { status: 400 }
      )
    }
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }
    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      )
    }
    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }
    if (message.length > MAX_MESSAGE_LENGTH) {
      return NextResponse.json(
        { error: `Message must be at most ${MAX_MESSAGE_LENGTH} characters` },
        { status: 400 }
      )
    }

    const to = process.env.CONTACT_EMAIL
      ? [process.env.CONTACT_EMAIL]
      : ADMIN_EMAILS

    if (to.length === 0) {
      return NextResponse.json(
        { error: 'No recipient configured' },
        { status: 503 }
      )
    }

    const subject = `【 Leon Hong Art 】 Message from ${name}`
    const html = `
      <pre style="white-space: pre-wrap; font-family: inherit;">${escapeHtml(message)}</pre>
      <hr>
      <p>From: ${escapeHtml(name)}</p>
      <p>Email: ${escapeHtml(email)}</p>
    `

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      replyTo: email,
      subject,
      html,
    })

    if (error) {
      console.error('Resend error:', error)
      return NextResponse.json(
        { error: error.message || 'Failed to send email' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, id: data?.id })
  } catch (e) {
    console.error('Contact API error:', e)
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
}

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }
  return text.replace(/[&<>"']/g, (ch) => map[ch] ?? ch)
}
