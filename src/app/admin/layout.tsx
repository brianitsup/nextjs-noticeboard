"use client";

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

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
        // First check if we have a session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session) {
          isRedirecting = true;
          router.replace('/auth/admin-signin');
          return;
        }

        // Then get the user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          isRedirecting = true;
          router.replace('/auth/admin-signin');
          return;
        }

        // Check if user has admin access
        const { data: userRole, error: roleError } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single();

        if (roleError || !userRole || userRole.role !== 'admin') {
          await supabase.auth.signOut();
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

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      router.replace('/auth/admin-signin');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 flex">
            <a href="/admin" className="mr-6 flex items-center space-x-2">
              <span className="font-bold">Notice Board Admin</span>
            </a>
            <nav className="flex items-center space-x-6 text-sm font-medium">
              <a
                href="/admin"
                className="transition-colors hover:text-foreground/80"
              >
                Notices
              </a>
              <a
                href="/admin/users"
                className="transition-colors hover:text-foreground/80"
              >
                Users
              </a>
            </nav>
          </div>
          <div className="flex-1" />
          <button
            onClick={handleSignOut}
            className="px-4 py-2 hover:opacity-80"
          >
            Sign Out
          </button>
        </div>
      </header>
      <main className="flex-1 container py-6">
        {children}
      </main>
    </div>
  );
} 