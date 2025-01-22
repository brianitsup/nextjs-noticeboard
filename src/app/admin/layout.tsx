"use client";

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { 
  LayoutDashboard, 
  FileText, 
  FolderTree, 
  BookOpen, 
  Users, 
  User, 
  Settings,
  LogOut,
  Database
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const sidebarNavItems = [
  {
    title: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard
  },
  {
    title: "Notices",
    href: "/admin/notices",
    icon: FileText
  },
  {
    title: "Categories",
    href: "/admin/categories",
    icon: FolderTree
  },
  {
    title: "Blog",
    href: "/admin/blog",
    icon: BookOpen
  },
  {
    title: "Users",
    href: "/admin/users",
    icon: Users
  }
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // Check Supabase connection
    const checkConnection = async () => {
      try {
        const { data, error } = await supabase
          .from('health_check')
          .select('*')
          .limit(1);
        setIsOnline(!error);
      } catch {
        setIsOnline(false);
      }
    };

    checkConnection();
    const interval = setInterval(checkConnection, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [supabase]);

  const handleSignOut = async () => {
    try {
      // Sign out which will clear the session
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      // Force clear any remaining auth state
      await supabase.auth.getSession();
      
      // Redirect to sign in page
      router.replace('/auth/admin-signin');
    } catch (error) {
      console.error('Error signing out:', error);
      // Fallback redirect
      window.location.href = '/auth/admin-signin';
    }
  };

  useEffect(() => {
    let isRedirecting = false;
    let mounted = true;

    const checkAuth = async () => {
      if (isRedirecting || !mounted) return;

      try {
        const { data: { session }, error: authError } = await supabase.auth.getSession();
        
        if (authError) {
          throw authError;
        }

        if (!session) {
          isRedirecting = true;
          router.replace('/auth/admin-signin');
          return;
        }

        // Check user role from database
        const { data: userData, error: roleError } = await supabase
          .from('users')
          .select('role')
          .eq('id', session.user.id)
          .single();

        if (roleError) {
          console.error('Error fetching user role:', roleError);
          throw roleError;
        }

        // Check if user has admin role
        const isAdmin = userData?.role === 'admin';

        if (!isAdmin) {
          isRedirecting = true;
          await supabase.auth.signOut(); // Force sign out if not admin
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
      if (!mounted) return;
      
      if (event === 'SIGNED_OUT' || !session) {
        isRedirecting = true;
        router.replace('/auth/admin-signin');
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        checkAuth(); // Recheck auth when session changes
      }
    });

    // Run auth check immediately
    checkAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [router, pathname, supabase]);

  return (
    <div className="grid min-h-screen w-full lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-muted/40 lg:block">
        <div className="flex flex-col gap-2 h-full">
          <div className="flex h-[60px] items-center border-b px-6">
            <Link
              href="/admin"
              className="flex items-center gap-2 font-semibold"
            >
              <Database className="h-6 w-6" />
              <span>Admin Panel</span>
            </Link>
          </div>
          <div className="flex-1 flex flex-col gap-1 p-4">
            {sidebarNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  pathname === item.href
                    ? "bg-secondary text-secondary-foreground"
                    : "text-muted-foreground hover:bg-secondary/50 hover:text-secondary-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.title}</span>
              </Link>
            ))}
          </div>
          {/* Bottom section */}
          <div className="border-t p-4">
            <div className="space-y-1">
              <Link
                href="/admin/profile"
                className={cn(
                  "flex items-center space-x-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  pathname === '/admin/profile'
                    ? "bg-secondary text-secondary-foreground"
                    : "text-muted-foreground hover:bg-secondary/50 hover:text-secondary-foreground"
                )}
              >
                <User className="h-4 w-4" />
                <span>Profile</span>
              </Link>
              <Link
                href="/admin/settings"
                className={cn(
                  "flex items-center space-x-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  pathname === '/admin/settings'
                    ? "bg-secondary text-secondary-foreground"
                    : "text-muted-foreground hover:bg-secondary/50 hover:text-secondary-foreground"
                )}
              >
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </Link>
              <button
                onClick={handleSignOut}
                className="flex w-full items-center space-x-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary/50 hover:text-secondary-foreground"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <header className="flex h-14 lg:h-[60px] items-center gap-4 border-b bg-muted/40 px-6">
          <Link href="/" className="lg:hidden">
            <Database className="h-6 w-6" />
            <span className="sr-only">Home</span>
          </Link>
        </header>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
} 