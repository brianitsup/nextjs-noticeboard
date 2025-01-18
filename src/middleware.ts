import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  // Refresh session if expired
  const { data: { session } } = await supabase.auth.getSession()

  // Handle admin routes
  if (req.nextUrl.pathname.startsWith('/admin')) {
    // Allow access to signin page
    if (req.nextUrl.pathname === '/admin/signin') {
      // If already authenticated, redirect to admin dashboard
      if (session) {
        return NextResponse.redirect(new URL('/admin', req.url))
      }
      // Allow access to signin page for non-authenticated users
      return res
    }

    // For all other admin routes, require authentication
    if (!session) {
      return NextResponse.redirect(new URL('/admin/signin', req.url))
    }
  }

  return res
}

export const config = {
  matcher: ['/admin', '/admin/:path*']
} 