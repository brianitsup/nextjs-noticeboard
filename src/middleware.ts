import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  // Create a response object to modify
  const res = NextResponse.next()
  
  // Create the Supabase client
  const supabase = createMiddlewareClient({ req, res })

  // Check if this is an admin route
  if (req.nextUrl.pathname.startsWith('/admin')) {
    try {
      // Refresh the session to ensure we have the latest data
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()

      if (sessionError) {
        console.error('Session error:', sessionError)
        throw sessionError
      }

      // If no session, redirect to sign-in
      if (!session) {
        const redirectUrl = new URL('/auth/admin-signin', req.url)
        redirectUrl.searchParams.set('returnTo', req.nextUrl.pathname)
        return NextResponse.redirect(redirectUrl)
      }

      // Check if user has admin role from session metadata
      const isAdmin = session.user.role === 'admin' || session.user.app_metadata?.role === 'admin'

      if (!isAdmin) {
        await supabase.auth.signOut()
        const redirectUrl = new URL('/auth/admin-signin', req.url)
        redirectUrl.searchParams.set('returnTo', req.nextUrl.pathname)
        return NextResponse.redirect(redirectUrl)
      }

      // Set the session in the response
      return res
    } catch (error) {
      console.error('Middleware error:', error)
      const redirectUrl = new URL('/auth/admin-signin', req.url)
      redirectUrl.searchParams.set('returnTo', req.nextUrl.pathname)
      return NextResponse.redirect(redirectUrl)
    }
  }

  // Not an admin route, proceed normally
  return res
}

export const config = {
  matcher: ['/admin', '/admin/:path*']
} 