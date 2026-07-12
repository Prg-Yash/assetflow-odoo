import { NextRequest, NextResponse } from 'next/server'

const apiBaseUrl = (process.env.NEXT_PUBLIC_API_BASE_URL ?? 'https://lr2.aryanshinde.in/api/v1').replace(/\/$/, '')

export async function proxy(request: NextRequest) {
  const sessionResponse = await fetch(`${apiBaseUrl}/auth/get-session`, {
    headers: {
      cookie: request.headers.get('cookie') ?? '',
    },
    cache: 'no-store',
  }).catch(() => null)

  if (sessionResponse?.ok) {
    const session = await sessionResponse.json().catch(() => null)
    if (session?.user) {
      return NextResponse.next()
    }
  }

  const loginUrl = new URL('/auth/login', request.url)
  loginUrl.searchParams.set('callbackURL', request.nextUrl.pathname + request.nextUrl.search)
  return NextResponse.redirect(loginUrl)
}

export const config = {
  matcher: ['/dashboard/:path*'],
}
