"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { adminLoginRateLimit } from "@/lib/rate-limit";
import { activityLogger } from "@/lib/activity-logger";

export default function AdminSignIn() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const supabase = createClient();
  const { toast } = useToast();
  const router = useRouter();

  // Function to get client IP (for rate limiting)
  const getClientIdentifier = async () => {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch (error) {
      // Fallback to a session-based identifier if IP lookup fails
      return crypto.randomUUID();
    }
  };

  // Check for existing session on mount
  React.useEffect(() => {
    const checkExistingSession = async () => {
      try {
        console.log("🔍 Checking for existing session...");
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (!session || error) {
          console.log("ℹ️ No existing session");
          return;
        }

        // Check if user has appropriate role
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('role')
          .eq('id', session.user.id)
          .single();

        if (!userError && userData?.role && ['admin', 'editor', 'moderator'].includes(userData.role)) {
          console.log("✅ Valid admin session found");
          router.replace('/admin/dashboard');
        }
      } catch (error) {
        console.error("❌ Session check error:", error);
      }
    };

    const pathname = window.location.pathname;
    // Only check session if we're on the admin-signin page
    if (pathname === '/auth/admin-signin') {
      checkExistingSession();
    }
  }, [router, supabase.auth]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log("🚀 Starting sign-in process...");
      
      // Check rate limiting
      const clientId = await getClientIdentifier();
      const rateLimitCheck = adminLoginRateLimit.check(clientId);

      if (rateLimitCheck.blocked) {
        const blockedUntil = rateLimitCheck.blockedUntil;
        throw new Error(
          `Too many login attempts. Please try again ${blockedUntil ? `after ${blockedUntil.toLocaleTimeString()}` : 'later'}.`
        );
      }

      console.log("✅ Rate limit check passed");

      // Sign in with password
      console.log("🔑 Attempting to sign in with Supabase...");
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError || !data?.user) {
        console.error("❌ Sign in failed:", signInError);
        throw signInError || new Error('Sign in failed');
      }

      console.log("✅ Sign in successful, checking role...");

      // Check if user has appropriate role in their metadata
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('role')
        .eq('id', data.user.id)
        .single();

      if (userError) {
        console.error("❌ Error fetching user role:", userError);
        throw new Error("Failed to verify user role");
      }

      console.log("🔑 Database role:", userData?.role);
      
      const hasAccess = ['admin', 'editor', 'moderator'].includes(userData?.role || '');

      if (!hasAccess) {
        console.log("❌ User does not have appropriate role");
        // Sign out if not authorized
        await supabase.auth.signOut();
        throw new Error("You don't have permission to access the admin area");
      }

      console.log("✅ Role confirmed:", userData.role);

      // Reset rate limit on successful login
      adminLoginRateLimit.reset(clientId);

      // Log the successful login
      console.log("📝 Logging successful login...");
      await activityLogger.log({
        action: 'Admin Login',
        details: 'Successfully logged into admin dashboard',
        user_id: data.user.id
      });

      console.log("✅ Activity logged");
      console.log("🚀 Redirecting to dashboard...");

      // Use router.replace for a cleaner navigation
      router.replace('/admin/dashboard');
      
    } catch (error: any) {
      console.error("❌ Sign in error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to sign in",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <Card className="w-full max-w-[400px]">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">Admin Sign In</CardTitle>
          <CardDescription>
            Enter your credentials to access the admin dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                required
                autoComplete="username"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                required
                autoComplete="current-password"
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 