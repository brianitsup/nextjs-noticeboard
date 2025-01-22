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
  if (req.nextUrl.pathname.startsWith('/admin') || req.nextUrl.pathname === '/auth/admin-signin') {
    console.log('👮 Protected route detected');
    
    try {
      console.log('🔒 Checking session...');
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()

      if (sessionError) {
        console.error('❌ Session error:', sessionError)
        throw sessionError
      }

      // Special handling for admin sign-in page
      if (req.nextUrl.pathname === '/auth/admin-signin') {
        if (!session) {
          console.log('✅ No session on sign-in page, allowing access');
          return res;
        }

        // If there's a session, verify the role
        const { data: userData, error: roleError } = await supabase
          .from('users')
          .select('role')
          .eq('id', session.user.id)
          .single();

        if (!roleError && userData?.role && ['admin', 'editor', 'moderator'].includes(userData.role)) {
          console.log('✅ Valid session found on sign-in page, redirecting to dashboard');
          return NextResponse.redirect(new URL('/admin/dashboard', req.url));
        }
      }

      // For all other admin routes, require a session
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
      // Check if user has admin role from database
      const { data: userData, error: roleError } = await supabase
        .from('users')
        .select('role')
        .eq('id', session.user.id)
        .single();

      if (roleError) {
        console.error('❌ Role check error:', roleError);
        throw roleError;
      }

      const role = userData?.role || '';
      console.log('👤 User role:', role);

      // Define route access permissions
      const routePermissions: Record<string, string[]> = {
        '/admin/dashboard': ['admin', 'editor', 'moderator'],
        '/admin/notices': ['admin', 'editor', 'moderator'],
        '/admin/blog': ['admin', 'editor', 'moderator'],
        '/admin/categories': ['admin', 'editor'],
        '/admin/users': ['admin', 'moderator'],
        '/admin/profile': ['admin', 'editor', 'moderator'],
        '/admin/settings': ['admin']
      };

      // Get the base route (e.g., /admin/blog from /admin/blog/123)
      const baseRoute = '/' + req.nextUrl.pathname.split('/').slice(1, 3).join('/');
      const allowedRoles = routePermissions[baseRoute] || ['admin'];

      const hasAccess = allowedRoles.includes(role);
      console.log('🔒 Access check:', { baseRoute, allowedRoles, hasAccess });

      if (!hasAccess) {
        console.log('⚠️ Not authorized for this route, redirecting to dashboard');
        // If user has any admin access but not for this route, redirect to dashboard
        if (['admin', 'editor', 'moderator'].includes(role)) {
          return NextResponse.redirect(new URL('/admin/dashboard', req.url));
        }
        // Otherwise, sign out and redirect to sign-in
        await supabase.auth.signOut();
        const redirectUrl = new URL('/auth/admin-signin', req.url);
        redirectUrl.searchParams.set('returnTo', req.nextUrl.pathname);
        return NextResponse.redirect(redirectUrl);
      }

      console.log('✅ Role access confirmed for route');

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