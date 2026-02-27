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

const BOT_MAX_IMAGE_WIDTH = 1000 // 爬蟲僅允許取得 w<=1000 的小圖，避免爬太多

export function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname
  if (!pathname.startsWith('/api/image')) return NextResponse.next()

  const userAgent = req.headers.get('user-agent')
  const isBot = isLikelyBot(userAgent)

  // 大圖 zoom：一律阻擋爬蟲
  if (pathname.startsWith('/api/image/zoom')) {
    if (isBot) return new NextResponse('Forbidden', { status: 403 })
    return NextResponse.next()
  }

  // 小圖 /api/image：爬蟲僅允許 w<=1000，避免爬太多
  if (isBot) {
    const w = req.nextUrl.searchParams.get('w')
    const parsed = w ? parseInt(w, 10) : 0
    if (Number.isFinite(parsed) && parsed > BOT_MAX_IMAGE_WIDTH) {
      return new NextResponse('Forbidden', { status: 403 })
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/api/image/:path*',
}
