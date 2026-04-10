import { NextRequest, NextResponse } from 'next/server'

/** Rate limiter in-memory por IP — janela deslizante simples */
const requests = new Map<string, number[]>()
const WINDOW_MS = 60_000 // 1 minuto
const MAX_REQUESTS = 15  // máximo por janela

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const timestamps = requests.get(ip) ?? []

  // Remove entradas fora da janela
  const recent = timestamps.filter(t => now - t < WINDOW_MS)

  if (recent.length >= MAX_REQUESTS) {
    requests.set(ip, recent)
    return true
  }

  recent.push(now)
  requests.set(ip, recent)
  return false
}

// Limpeza periódica para não acumular IPs antigos
setInterval(() => {
  const now = Date.now()
  for (const [ip, timestamps] of requests) {
    const recent = timestamps.filter(t => now - t < WINDOW_MS)
    if (recent.length === 0) {
      requests.delete(ip)
    } else {
      requests.set(ip, recent)
    }
  }
}, WINDOW_MS)

export function middleware(request: NextRequest) {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: 'Muitas requisições. Aguarde um momento antes de tentar novamente.' },
      { status: 429 }
    )
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/api/:path*',
}
