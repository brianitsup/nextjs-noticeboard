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

  useEffect(() => {
    let isRedirecting = false;

    const checkAuth = async () => {
      if (isRedirecting) return;

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
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-full flex-col">
          {/* Brand */}
          <div className="border-b p-6">
            <Link href="/admin/dashboard" className="flex items-center space-x-2">
              <span className="font-bold">Notice Board Admin</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-4">
            {sidebarNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center space-x-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    pathname === item.href
                      ? "bg-secondary text-secondary-foreground"
                      : "text-muted-foreground hover:bg-secondary/50 hover:text-secondary-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.title}</span>
                </Link>
              );
            })}
          </nav>

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
              <form action="/auth/signout" method="POST">
                <button
                  type="submit"
                  className="flex w-full items-center space-x-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary/50 hover:text-secondary-foreground"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </form>
            </div>
          </div>

          {/* Credits and Status */}
          <div className="border-t p-4">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center space-x-1">
                <Database className="h-3 w-3" />
                <span>
                  {isOnline ? 'Connected' : 'Offline'}
                </span>
              </div>
              <span>© 2024 Notice Board</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="pl-64 w-full">
        <div className="h-full">
          {children}
        </div>
      </main>
    </div>
  );
} 