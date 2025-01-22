"use client";

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { User, LogOut } from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  useEffect(() => {
    let isRedirecting = false;

    const checkAuth = async () => {
      if (isRedirecting) return;

      try {
        // Get the current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session) {
          isRedirecting = true;
          router.replace('/auth/admin-signin');
          return;
        }

        // Check if user has admin role from session metadata
        const isAdmin = session.user.role === 'admin' || session.user.app_metadata?.role === 'admin';

        if (!isAdmin) {
          isRedirecting = true;
          router.replace('/auth/admin-signin');
          return;
        }
      } catch (error) {
        console.error('Auth check error:', error);
        isRedirecting = true;
        router.replace('/auth/admin-signin');
      }
    };

    // Set up auth state change listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        router.replace('/auth/admin-signin');
      }
    });

    // Run auth check immediately
    checkAuth();

    return () => {
      subscription.unsubscribe();
    };
  }, [router, pathname, supabase]);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 flex">
            <a href="/admin/dashboard" className="mr-6 flex items-center space-x-2">
              <span className="font-bold">Notice Board Admin</span>
            </a>
            <nav className="flex items-center space-x-6 text-sm font-medium">
              <a
                href="/admin/dashboard"
                className={`transition-colors hover:text-foreground/80 ${pathname === '/admin/dashboard' ? 'text-foreground' : 'text-foreground/60'}`}
              >
                Dashboard
              </a>
              <a
                href="/admin/notices"
                className={`transition-colors hover:text-foreground/80 ${pathname === '/admin/notices' ? 'text-foreground' : 'text-foreground/60'}`}
              >
                Notices
              </a>
              <a
                href="/admin/categories"
                className={`transition-colors hover:text-foreground/80 ${pathname === '/admin/categories' ? 'text-foreground' : 'text-foreground/60'}`}
              >
                Categories
              </a>
              <a
                href="/admin/blog"
                className={`transition-colors hover:text-foreground/80 ${pathname === '/admin/blog' ? 'text-foreground' : 'text-foreground/60'}`}
              >
                Blog
              </a>
              <a
                href="/admin/users"
                className={`transition-colors hover:text-foreground/80 ${pathname === '/admin/users' ? 'text-foreground' : 'text-foreground/60'}`}
              >
                Users
              </a>
            </nav>
          </div>
          <div className="flex-1" />
          <div className="flex items-center space-x-6">
            <a
              href="/admin/profile"
              className={`flex h-8 w-8 items-center justify-center transition-colors hover:text-foreground/80 ${pathname === '/admin/profile' ? 'text-foreground' : 'text-foreground/60'}`}
            >
              <User className="h-4 w-4" />
            </a>
            <form action="/auth/signout" method="POST">
              <button
                type="submit"
                className="flex h-8 w-8 items-center justify-center transition-colors hover:text-foreground/80 text-foreground/60"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="flex-1 container py-6">
        {children}
      </main>
    </div>
  );
} 