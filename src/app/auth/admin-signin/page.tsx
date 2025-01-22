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

      console.log("✅ Sign in successful, checking admin role...");
      console.log("👤 User data:", {
        id: data.user.id,
        role: data.user.role,
        appMetadataRole: data.user.app_metadata?.role
      });

      // Check if user has admin role in their metadata
      const isAdmin = data.user.role === 'admin' || data.user.app_metadata?.role === 'admin';

      if (!isAdmin) {
        console.log("❌ User is not an admin");
        // Sign out if not admin
        await supabase.auth.signOut();
        throw new Error("You don't have permission to access the admin area");
      }

      console.log("✅ Admin role confirmed");

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
      console.log("🔄 Setting session...");

      // Set the session explicitly
      await supabase.auth.setSession({
        access_token: data.session!.access_token,
        refresh_token: data.session!.refresh_token,
      });

      console.log("✅ Session set");

      // Verify the session was set correctly
      const { data: { session: verifySession }, error: verifyError } = await supabase.auth.getSession();
      if (verifyError || !verifySession) {
        console.error("❌ Failed to verify session:", verifyError);
        throw new Error("Failed to establish session");
      }

      console.log("✅ Session verified");
      console.log("🚀 Redirecting to dashboard...");

      // Redirect to admin dashboard
      window.location.href = '/admin/dashboard';
      
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

  // Check for existing session on mount
  React.useEffect(() => {
    const checkExistingSession = async () => {
      console.log("🔍 Checking for existing session...");
      const { data: { session }, error } = await supabase.auth.getSession();
      if (session) {
        console.log("⚠️ Found existing session, clearing it...");
        await supabase.auth.signOut();
      }
    };
    checkExistingSession();
  }, [supabase.auth]);

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