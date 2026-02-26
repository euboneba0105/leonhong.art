import { NextRequest, NextResponse } from 'next/server'

const BOT_PATTERNS = [
  /googlebot/i,
  /bingbot/i,
  /slurp/i,
  /duckduckbot/i,
  /baiduspider/i,
  /yandexbot/i,
  /facebookexternalhit/i,
  /twitterbot/i,
  /linkedinbot/i,
  /telegrambot/i,
  /ahrefsbot/i,
  /semrushbot/i,
  /mj12bot/i,
  /dotbot/i,
  /petalbot/i,
  /curl/i,
  /wget/i,
  /python-requests/i,
  /go-http-client/i,
  /^java\//i,
  /^php\//i,
  /headless/i,
  /selenium/i,
  /puppeteer/i,
  /phantomjs/i,
  /bot$/i,
  /crawler/i,
  /spider/i,
  /scraper/i,
]

function isLikelyBot(userAgent: string | null): boolean {
  if (!userAgent || !userAgent.trim()) return false
  return BOT_PATTERNS.some((p) => p.test(userAgent))
}

export function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname
  if (!pathname.startsWith('/api/image')) return NextResponse.next()

  const userAgent = req.headers.get('user-agent')
  if (!isLikelyBot(userAgent)) return NextResponse.next()

  return new NextResponse('Forbidden', { status: 403 })
}

export const config = {
  matcher: '/api/image/:path*',
}
