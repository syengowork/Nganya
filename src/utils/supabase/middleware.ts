import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  // 1. Create an unmodified response first
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // 2. Initialize Supabase Client
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
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

  // 3. SECURE AUTH CHECK: Always use getUser(), never getSession()
  // This validates the auth token with the real Supabase Auth server
  const { data: { user }, error } = await supabase.auth.getUser()

  // 4. ROUTE PROTECTION LOGIC
  const path = request.nextUrl.pathname

  // Define routes that require authentication
  const isProtectedRoute = path.startsWith('/dashboard') || path.startsWith('/api/protected')
  
  // Define auth routes (so we don't redirect logged-in users back to login)
  const isAuthRoute = path.startsWith('/login') || path.startsWith('/register')

  // A. BLOCK: Unauthenticated users trying to access dashboard
  if (isProtectedRoute && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('next', path) // Remembers where they wanted to go
    return NextResponse.redirect(url)
  }

  // B. REDIRECT: Authenticated users trying to access login/register
  if (isAuthRoute && user) {
    const url = request.nextUrl.clone()
    // You can fetch the user's role here if needed to redirect to specific dashboards
    url.pathname = '/dashboard/user/explore' // Default landing
    return NextResponse.redirect(url)
  }

  return response
}