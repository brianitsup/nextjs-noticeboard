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
import { Card } from "@/components/ui/card";

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
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        router.replace('/auth/admin-signin');
        return;
      }

      // Get role from database
      const { data: userData, error: roleError } = await supabase
        .from('users')
        .select('id, email, role, created_at')
        .eq('id', session.user.id)
        .single();

      if (roleError) {
        console.error('Error fetching user role:', roleError);
        throw roleError;
      }

      const hasAccess = ['admin', 'editor', 'moderator'].includes(userData?.role || '');

      if (!hasAccess) {
        toast({
          title: "Access Denied",
          description: "You don't have permission to access this area.",
          variant: "destructive",
        });
        router.replace('/auth/admin-signin');
        return;
      }

      setUser({ ...session.user, ...userData });
      setFormData({
        email: session.user.email || "",
        newPassword: "",
        confirmPassword: "",
      });

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
        const { error: authError } = await supabase.auth.updateUser(updates);
        if (authError) throw authError;

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
      <div className="p-8">
        <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
          <div className="text-lg">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Profile</h1>
        <Button
          onClick={() => setIsEditing(!isEditing)}
          variant="outline"
        >
          {isEditing ? "Cancel" : "Edit Profile"}
        </Button>
      </div>

      <Card>
        {!isEditing ? (
          <div className="p-6 space-y-4">
            <div className="grid gap-2">
              <Label className="text-sm font-medium">Email</Label>
              <div className="text-sm">{user.email}</div>
            </div>
            <div className="grid gap-2">
              <Label className="text-sm font-medium">Role</Label>
              <div className="text-sm capitalize">{user.role}</div>
            </div>
            <div className="grid gap-2">
              <Label className="text-sm font-medium">Account Created</Label>
              <div className="text-sm">{user.created_at ? formatDate(user.created_at) : 'Not available'}</div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid gap-2">
              <Label htmlFor="email" className="text-sm font-medium">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="newPassword" className="text-sm font-medium">New Password (leave blank to keep unchanged)</Label>
              <Input
                id="newPassword"
                type="password"
                value={formData.newPassword}
                onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                disabled={!formData.newPassword}
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
} 