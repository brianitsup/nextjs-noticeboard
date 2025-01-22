import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Maximum session age in seconds (8 hours)
const MAX_SESSION_AGE = 8 * 60 * 60

export async function middleware(req: NextRequest) {
  console.log('🔍 Middleware executing for path:', req.nextUrl.pathname);
  
  // Create a response object to modify
  const res = NextResponse.next()
  
  // Create the Supabase client
  const supabase = createMiddlewareClient({ req, res })

  // Check if this is an admin route
  if (req.nextUrl.pathname.startsWith('/admin')) {
    console.log('👮 Admin route detected');
    
    try {
      // Skip auth check for admin sign-in page
      if (req.nextUrl.pathname === '/auth/admin-signin') {
        console.log('🔓 Skipping auth check for admin sign-in page');
        return res;
      }

      console.log('🔒 Checking session...');
      // Refresh and validate the session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()

      if (sessionError) {
        console.error('❌ Session error:', sessionError)
        throw sessionError
      }

      // If no session, redirect to sign-in
      if (!session) {
        console.log('⚠️ No session found, redirecting to sign-in');
        const redirectUrl = new URL('/auth/admin-signin', req.url)
        redirectUrl.searchParams.set('returnTo', req.nextUrl.pathname)
        return NextResponse.redirect(redirectUrl)
      }

      console.log('✅ Session found, checking expiration...');
      // Check if session is expired
      const now = Math.floor(Date.now() / 1000); // Current time in seconds
      const expiresAt = session.expires_at || now + MAX_SESSION_AGE; // Default to current time + max age if not set

      console.log('Session details:', {
        now,
        expiresAt,
        timeLeft: expiresAt - now
      });

      if (now >= expiresAt) {
        console.log('⚠️ Session expired, redirecting to sign-in');
        await supabase.auth.signOut()
        const redirectUrl = new URL('/auth/admin-signin', req.url)
        redirectUrl.searchParams.set('returnTo', req.nextUrl.pathname)
        return NextResponse.redirect(redirectUrl)
      }

      console.log('✅ Session valid, checking admin role...');
      // Check if user has admin role from session metadata
      const isAdmin = session.user.role === 'admin' || session.user.app_metadata?.role === 'admin'
      console.log('👤 User roles:', {
        role: session.user.role,
        appMetadataRole: session.user.app_metadata?.role
      });

      if (!isAdmin) {
        console.log('⚠️ Not an admin user, redirecting to sign-in');
        await supabase.auth.signOut()
        const redirectUrl = new URL('/auth/admin-signin', req.url)
        redirectUrl.searchParams.set('returnTo', req.nextUrl.pathname)
        return NextResponse.redirect(redirectUrl)
      }

      console.log('✅ Admin role confirmed');

      // Set session cookie
      const { data: { session: refreshedSession } } = await supabase.auth.getSession()
      if (refreshedSession) {
        console.log('🔄 Refreshing session');
        await supabase.auth.setSession(refreshedSession)
      }

      // Generate new CSRF token for GET requests
      if (req.method === 'GET') {
        console.log('🔑 Generating new CSRF token');
        const newCsrfToken = crypto.randomUUID()
        res.cookies.set('csrf-token', newCsrfToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: MAX_SESSION_AGE
        })
      }

      console.log('✅ All checks passed, proceeding to admin route');
      return res
    } catch (error) {
      console.error('❌ Middleware error:', error)
      const redirectUrl = new URL('/auth/admin-signin', req.url)
      redirectUrl.searchParams.set('returnTo', req.nextUrl.pathname)
      return NextResponse.redirect(redirectUrl)
    }
  }

  return res
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/auth/admin-signin'
  ]
} 