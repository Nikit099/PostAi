import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  console.log('🔵 [Middleware] Path:', request.nextUrl.pathname)
  console.log('🔵 [Middleware] Cookies:', request.cookies.getAll().map(c => c.name))
  
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          const cookies = request.cookies.getAll()
          console.log('🔵 [Middleware] getAll cookies:', cookies.map(c => ({ name: c.name, value: c.value.substring(0, 10) + '...' })))
          return cookies
        },
        setAll(cookiesToSet) {
          console.log('🔵 [Middleware] setAll cookies:', cookiesToSet.map(c => ({ name: c.name, value: c.value.substring(0, 10) + '...' })))
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Проверяем сессию пользователя
  console.log('🔵 [Middleware] Checking session...')
  const {
    data: { session },
    error: sessionError
  } = await supabase.auth.getSession()
  
  if (sessionError) {
    console.error('🔴 [Middleware] Session error:', sessionError)
  }
  
  console.log('🔵 [Middleware] Session exists:', !!session)
  console.log('🔵 [Middleware] User email:', session?.user?.email)
  console.log('🔵 [Middleware] Session expires at:', session?.expires_at)

  const { pathname } = request.nextUrl

  // Защищенные маршруты
  const protectedRoutes = ['/', '/accounts', '/generate', '/publish', '/success']
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  )

  // Маршруты авторизации
  const authRoutes = ['/login', '/register']
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route))

  console.log('🔵 [Middleware] Is protected route:', isProtectedRoute)
  console.log('🔵 [Middleware] Is auth route:', isAuthRoute)

  if (isProtectedRoute && !session) {
    console.log('🔴 [Middleware] Redirecting to login (protected route, no session)')
    const redirectUrl = new URL('/login', request.url)
    return NextResponse.redirect(redirectUrl)
  }

  if (isAuthRoute && session) {
    console.log('🟢 [Middleware] Redirecting to home (auth route, has session)')
    const redirectUrl = new URL('/', request.url)
    return NextResponse.redirect(redirectUrl)
  }

  console.log('🟡 [Middleware] No redirect needed')
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes (они обрабатывают авторизацию самостоятельно)
     */
    '/((?!_next/static|_next/image|favicon.ico|public|api).*)',
  ],
}