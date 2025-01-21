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
      // Check session
      const { data: { session }, error } = await supabase.auth.getSession()

      // If no session, redirect to sign-in
      if (!session) {
        const redirectUrl = new URL('/auth/admin-signin', req.url)
        redirectUrl.searchParams.set('returnTo', req.nextUrl.pathname)
        return NextResponse.redirect(redirectUrl)
      }

      // Check if user has admin access
      const { data: userRole, error: roleError } = await supabase
        .from('users')
        .select('role')
        .eq('id', session.user.id)
        .single();

      if (roleError || !userRole || userRole.role !== 'admin') {
        await supabase.auth.signOut();
        const redirectUrl = new URL('/auth/admin-signin', req.url)
        redirectUrl.searchParams.set('returnTo', req.nextUrl.pathname)
        return NextResponse.redirect(redirectUrl)
      }

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