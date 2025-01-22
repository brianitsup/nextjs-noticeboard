"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import type { User, UserRole } from "@/types/user";
import { formatDate } from "@/lib/date-utils";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const supabase = createClient();

  useEffect(() => {
    checkAuthAndFetchData();
  }, []);

  async function checkAuthAndFetchData() {
    try {
      const { data: { session }, error: authError } = await supabase.auth.getSession();
      
      if (authError) throw authError;
      
      if (!session) {
        toast({
          title: "Authentication Error",
          description: "Please sign in to access this area.",
          variant: "destructive",
        });
        return;
      }

      // Get role from session metadata
      const role = session.user.role || session.user.app_metadata?.role;
      
      if (!role) {
        console.error("No role found in session:", session);
        toast({
          title: "Error",
          description: "Unable to determine user role",
          variant: "destructive",
        });
        return;
      }

      if (!['admin', 'moderator'].includes(role)) {
        toast({
          title: "Access Denied",
          description: "You don't have permission to view users.",
          variant: "destructive",
        });
        return;
      }

      setCurrentUserRole(role as UserRole);

      // Fetch users after role is confirmed
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id, email, role, created_at')
        .order('created_at', { ascending: false });

      if (usersError) {
        console.error("Error fetching users:", {
          error: usersError,
          session: session,
          role: role
        });
        toast({
          title: "Error",
          description: "Failed to fetch users. Please try again.",
          variant: "destructive",
        });
        return;
      }

      console.log("Successfully fetched users:", {
        count: users?.length || 0,
        role: role
      });

      setUsers(users || []);
    } catch (error) {
      console.error("Error in checkAuthAndFetchData:", {
        error,
        stack: error instanceof Error ? error.stack : undefined
      });
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  const refreshUsers = () => {
    setIsLoading(true);
    checkAuthAndFetchData();
  };

  async function handleDeleteUser(id: string) {
    if (currentUserRole !== 'admin') {
      toast({
        title: "Error",
        description: "Only administrators can delete users",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "User deleted successfully",
      });
      refreshUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while deleting user",
        variant: "destructive",
      });
    }
  }

  function UserForm({ user, onClose }: { user?: User; onClose: () => void }) {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
      email: user?.email ?? "",
      password: "",
      role: user?.role ?? "editor" as UserRole,
    });

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsLoading(true);

      try {
        if (user) {
          // Update existing user
          const { error: updateError } = await supabase
            .from('users')
            .update({
              email: formData.email,
              role: formData.role
            })
            .eq('id', user.id);

          if (updateError) throw updateError;

          toast({
            title: "Success",
            description: "User role updated successfully",
          });
        } else {
          try {
            // Create new user through API endpoint
            const response = await fetch('/api/admin/users', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                email: formData.email,
                password: formData.password,
              }),
            });

            let errorMessage = 'Failed to create user';
            
            try {
              const data = await response.json();
              
              if (!response.ok) {
                errorMessage = data.error || errorMessage;
                throw new Error(errorMessage);
              }

              if (!data.user) {
                throw new Error('No user data received');
              }

              toast({
                title: "Success",
                description: data.message || "User created successfully",
              });
              
              onClose();
              refreshUsers();
            } catch (parseError) {
              throw new Error(errorMessage);
            }
          } catch (error: any) {
            console.error("Error creating user:", error);
            toast({
              title: "Error",
              description: error.message,
              variant: "destructive",
            });
          } finally {
            setIsLoading(false);
          }
        }
      } catch (error: any) {
        console.error("Error saving user:", error);
        toast({
          title: "Error",
          description: error.message || "Failed to save user",
          variant: "destructive",
        });
      }
    };

    return (
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

        {!user && (
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              minLength={6}
            />
          </div>
        )}

        {user && (
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select
              value={formData.role}
              onValueChange={(value: UserRole) => setFormData({ ...formData, role: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Administrator</SelectItem>
                <SelectItem value="editor">Editor</SelectItem>
                <SelectItem value="moderator">Moderator</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : user ? "Update Role" : "Create User"}
          </Button>
        </div>
      </form>
    );
  }

  const handleCreateUser = () => {
    if (currentUserRole !== 'admin') {
      toast({
        title: "Error",
        description: "Only administrators can create users",
        variant: "destructive",
      });
      return;
    }
    setSelectedUser(null);
    setIsCreateModalOpen(true);
  };

  const handleEditUser = (user: User) => {
    if (currentUserRole !== 'admin') {
      toast({
        title: "Error",
        description: "Only administrators can edit users",
        variant: "destructive",
      });
      return;
    }
    setSelectedUser(user);
    setIsCreateModalOpen(true);
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

  if (!currentUserRole || !['admin', 'moderator'].includes(currentUserRole)) {
    return (
      <div className="p-8">
        <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
          <div className="text-lg text-destructive">Access Denied</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Users</h1>
        <Button onClick={handleCreateUser}>
          <Plus className="h-4 w-4 mr-2" />
          Create User
        </Button>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead>
              <tr className="bg-muted/50">
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Created At
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-background">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium">
                      {user.email}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-muted-foreground capitalize">
                      {user.role}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-muted-foreground">
                      {formatDate(user.created_at)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditUser(user)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteUser(user.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedUser ? "Edit User" : "Create User"}
            </DialogTitle>
          </DialogHeader>
          <UserForm
            user={selectedUser ?? undefined}
            onClose={() => setIsCreateModalOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
} 