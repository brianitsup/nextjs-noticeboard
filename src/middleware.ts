import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  // Refresh session if expired - required for Server Components
  const { data: { session } } = await supabase.auth.getSession()

  // Handle admin routes
  if (req.nextUrl.pathname.startsWith('/admin')) {
    // Allow access to signin page
    if (req.nextUrl.pathname === '/admin/signin') {
      return res
    }

    // For all other admin routes, require authentication
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.redirect(new URL('/admin/signin', req.url))
    }

    // Check if user has admin role
    const { data: userDetails } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (userDetails?.role !== 'admin') {
      return NextResponse.redirect(new URL('/', req.url))
    }
  }

  return res
}

export const config = {
  matcher: ['/admin', '/admin/:path*']
} 