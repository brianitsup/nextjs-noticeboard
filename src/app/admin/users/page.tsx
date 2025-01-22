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
  const { toast } = useToast();
  const supabase = createClient();

  useEffect(() => {
    fetchUsers();
    getCurrentUserRole();
  }, []);

  async function getCurrentUserRole() {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      const { data, error } = await supabase
        .from('users')
        .select('role')
        .eq('id', session.user.id)
        .single();

      if (!error && data) {
        setCurrentUserRole(data.role as UserRole);
      }
    }
  }

  async function fetchUsers() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data: users, error } = await supabase
      .from('users')
      .select(`
        id,
        email,
        role,
        created_at
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching users:", error);
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive",
      });
      return;
    }

    setUsers(users || []);
  }

  async function handleDeleteUser(id: string) {
    if (currentUserRole !== 'admin') {
      toast({
        title: "Error",
        description: "Only administrators can delete users",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase.auth.admin.deleteUser(id);

    if (error) {
      console.error("Error deleting user:", error);
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "User deleted successfully",
    });
    fetchUsers();
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
          // Update user
          const { error } = await supabase.auth.admin.updateUserById(user.id, {
            email: formData.email,
            ...(formData.password ? { password: formData.password } : {}),
          });

          if (error) throw error;

          // Update role
          const { error: roleError } = await supabase
            .from('users')
            .update({ role: formData.role })
            .eq('id', user.id);

          if (roleError) throw roleError;

          toast({
            title: "Success",
            description: "User updated successfully",
          });
        } else {
          // Create user
          const { error } = await supabase.auth.admin.createUser({
            email: formData.email,
            password: formData.password,
            email_confirm: true,
          });

          if (error) throw error;

          toast({
            title: "Success",
            description: "User created successfully",
          });
        }

        onClose();
        fetchUsers();
      } catch (error: any) {
        console.error("Error saving user:", error);
        toast({
          title: "Error",
          description: error.message || "Failed to save user",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
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

        <div className="space-y-2">
          <Label htmlFor="password">Password {user && "(leave blank to keep unchanged)"}</Label>
          <Input
            id="password"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required={!user}
          />
        </div>

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

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : user ? "Update" : "Create"}
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