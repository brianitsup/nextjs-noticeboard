"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          router.push("/admin/signin");
          return;
        }
        setIsLoading(false);
      } catch (error) {
        console.error("Auth check error:", error);
        toast({
          title: "Error",
          description: "Failed to verify authentication status",
          variant: "destructive",
        });
        router.push("/admin/signin");
      }
    };

    checkAuth();
  }, [router, toast, supabase]);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      router.push("/admin/signin");
    } catch (error) {
      console.error("Sign out error:", error);
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 hidden md:flex">
            <Link href="/admin" className="mr-6 flex items-center space-x-2">
              <span className="hidden font-bold sm:inline-block">
                Notice Board Admin
              </span>
            </Link>
            <nav className="flex items-center space-x-6 text-sm font-medium">
              <Link
                href="/admin"
                className={cn(
                  "transition-colors hover:text-foreground/80",
                  pathname === "/admin"
                    ? "text-foreground"
                    : "text-foreground/60"
                )}
              >
                Notices
              </Link>
              <Link
                href="/admin/users"
                className={cn(
                  "transition-colors hover:text-foreground/80",
                  pathname?.startsWith("/admin/users")
                    ? "text-foreground"
                    : "text-foreground/60"
                )}
              >
                Users
              </Link>
            </nav>
          </div>
          <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
            <div className="w-full flex-1 md:w-auto md:flex-none">
              {/* Add search or other controls here */}
            </div>
            <nav className="flex items-center">
              <Button
                variant="ghost"
                className="mr-6 text-base hover:bg-transparent hover:text-foreground/80"
                onClick={handleSignOut}
              >
                Sign Out
              </Button>
              <ThemeToggle />
            </nav>
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
} 