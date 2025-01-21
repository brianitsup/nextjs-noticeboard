"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { formatDate } from "@/lib/date-utils";
import type { UserRole } from "@/types/user";

export default function UserProfile() {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    newPassword: "",
    confirmPassword: "",
  });
  
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      // First check session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        router.replace('/auth/admin-signin');
        return;
      }

      // Check if user has admin role from session metadata
      const isAdmin = session.user.role === 'admin' || session.user.app_metadata?.role === 'admin';

      if (!isAdmin) {
        toast({
          title: "Access Denied",
          description: "You don't have permission to access this area.",
          variant: "destructive",
        });
        router.replace('/auth/admin-signin');
        return;
      }

      try {
        // Get additional user data
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('id, email, role, created_at')
          .eq('id', session.user.id)
          .single();

        if (userError) {
          // If user doesn't exist in the users table, create it
          if (userError.code === 'PGRST116') {
            const { data: newUser, error: createError } = await supabase
              .from('users')
              .upsert([
                {
                  id: session.user.id,
                  email: session.user.email,
                  role: 'admin',
                  created_at: session.user.created_at
                }
              ])
              .select('id, email, role, created_at')
              .single();

            if (createError) throw createError;
            
            setUser({
              ...session.user,
              ...newUser
            });
          } else {
            throw userError;
          }
        } else {
          // Set user data combining session and database info
          setUser({
            ...session.user,
            ...userData
          });
        }

        setFormData({
          email: session.user.email || "",
          newPassword: "",
          confirmPassword: "",
        });
      } catch (dbError) {
        console.error('Error fetching user data:', dbError);
        // Still set basic user data from session if DB query fails
        setUser({
          ...session.user,
          role: 'admin',
          created_at: session.user.created_at || new Date().toISOString(),
        });

        setFormData({
          email: session.user.email || "",
          newPassword: "",
          confirmPassword: "",
        });

        toast({
          title: "Warning",
          description: "Some user data could not be loaded, but basic functionality is available.",
          variant: "default",
        });
      }

      setIsLoading(false);
    } catch (error) {
      console.error('Auth check error:', error);
      toast({
        title: "Authentication Error",
        description: "Please sign in to access this area.",
        variant: "destructive",
      });
      router.replace('/auth/admin-signin');
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const updates: any = {};

      if (formData.email !== user.email) {
        updates.email = formData.email;
      }

      if (formData.newPassword) {
        if (formData.newPassword !== formData.confirmPassword) {
          throw new Error("Passwords do not match");
        }
        updates.password = formData.newPassword;
      }

      if (Object.keys(updates).length > 0) {
        // Update auth user
        const { error: authError } = await supabase.auth.updateUser(updates);
        if (authError) throw authError;

        // Update users table using upsert to handle both update and insert
        if (updates.email) {
          const { error: dbError } = await supabase
            .from('users')
            .upsert({
              id: user.id,
              email: updates.email,
              role: user.role,
              updated_at: new Date().toISOString()
            })
            .eq('id', user.id);
          
          if (dbError) throw dbError;
        }

        toast({
          title: "Success",
          description: "Profile updated successfully",
        });

        // Refresh user data
        checkAuth();
      }

      setIsEditing(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
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
    <div className="container max-w-2xl space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">User Profile</h1>
        <Button
          onClick={() => setIsEditing(!isEditing)}
          variant="outline"
        >
          {isEditing ? "Cancel" : "Edit Profile"}
        </Button>
      </div>

      {!isEditing ? (
        <div className="rounded-lg border p-6 space-y-4">
          <div>
            <Label>Email</Label>
            <div className="mt-1 text-lg">{user.email}</div>
          </div>
          <div>
            <Label>Role</Label>
            <div className="mt-1 text-lg capitalize">{user.role}</div>
          </div>
          <div>
            <Label>Account Created</Label>
            <div className="mt-1 text-lg">{user.created_at ? formatDate(user.created_at) : 'Not available'}</div>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password (leave blank to keep unchanged)</Label>
            <Input
              id="newPassword"
              type="password"
              value={formData.newPassword}
              onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
            />
          </div>

          {formData.newPassword && (
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              />
            </div>
          )}

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
} 