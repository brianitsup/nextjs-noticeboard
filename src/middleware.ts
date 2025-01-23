import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Maximum session age in seconds (8 hours)
const MAX_SESSION_AGE = 8 * 60 * 60

interface UserRoleData {
  role: string;
  is_admin: boolean;
  has_admin_access: boolean;
}

export async function middleware(req: NextRequest) {
  console.log('🔍 Middleware executing for path:', req.nextUrl.pathname);
  
  // Create a response object to modify
  const res = NextResponse.next()
  
  // Create the Supabase client
  const supabase = createMiddlewareClient({ req, res })

  // Check if this is an admin route
  if (req.nextUrl.pathname.startsWith('/admin') || req.nextUrl.pathname === '/auth/admin-signin') {
    console.log('👮 Protected route detected');
    
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()

      // Special handling for admin sign-in page
      if (req.nextUrl.pathname === '/auth/admin-signin') {
        if (!session) {
          console.log('✅ No session on sign-in page, allowing access');
          return res;
        }

        // If there's a session, check if user has admin access
        const { data: { user } } = await supabase.auth.getUser()
        if (user?.role && ['admin', 'editor', 'moderator'].includes(user.role)) {
          console.log('✅ Valid admin session found, redirecting to dashboard');
          return NextResponse.redirect(new URL('/admin/dashboard', req.url));
        }
      }

      // For all other admin routes, require a session
      if (!session) {
        console.log('⚠️ No session found, redirecting to sign-in');
        return NextResponse.redirect(new URL('/auth/admin-signin', req.url))
      }

      // Check if session is expired
      const now = Math.floor(Date.now() / 1000);
      const expiresAt = session.expires_at || now + MAX_SESSION_AGE;

      if (now >= expiresAt) {
        console.log('⚠️ Session expired, redirecting to sign-in');
        await supabase.auth.signOut()
        return NextResponse.redirect(new URL('/auth/admin-signin', req.url))
      }

      // Get user role directly from auth.users
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        throw new Error('Failed to get user data');
      }

      const userRole = user.role || 'user';
      const hasAdminAccess = ['admin', 'editor', 'moderator'].includes(userRole);

      if (!hasAdminAccess) {
        console.log('⚠️ Not authorized, redirecting to sign-in');
        await supabase.auth.signOut();
        return NextResponse.redirect(new URL('/auth/admin-signin', req.url));
      }

      // Special route restrictions
      if (req.nextUrl.pathname.startsWith('/admin/settings') && userRole !== 'admin') {
        console.log('⚠️ Settings restricted to admin only');
        return NextResponse.redirect(new URL('/admin/dashboard', req.url));
      }

      // Set session cookie
      const { data: { session: refreshedSession } } = await supabase.auth.getSession()
      if (refreshedSession) {
        console.log('🔄 Refreshing session');
        await supabase.auth.setSession(refreshedSession)
      }

      console.log('✅ All checks passed, proceeding to admin route');
      return res
    } catch (error) {
      console.error('❌ Middleware error:', error)
      return NextResponse.redirect(new URL('/auth/admin-signin', req.url))
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