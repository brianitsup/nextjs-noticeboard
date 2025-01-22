"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient, logSupabaseError } from "@/lib/supabase/client";
import type { Category, UserRole } from "@/types/notice";
import { CategoryForm } from "@/components/admin/category-form";
import { CategoryIcon } from "@/components/ui/category-icon";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";

export default function CategoriesManagement() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (userRole) {
      fetchData();
    }
  }, [userRole]);

  async function checkAuth() {
    try {
      const { data: { session }, error: authError } = await supabase.auth.getSession();
      
      if (authError) {
        throw authError;
      }

      if (!session) {
        router.push('/auth/admin-signin');
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

      const role = userData?.role || 'user';
      const hasAccess = ['admin', 'editor', 'moderator'].includes(role);

      if (!hasAccess) {
        toast({
          title: "Access Denied",
          description: "You don't have permission to access this area.",
          variant: "destructive",
        });
        router.push('/');
        return;
      }

      setUserRole(role as UserRole);
      setIsLoading(false);
    } catch (error) {
      logSupabaseError(error, "Checking authentication");
      toast({
        title: "Authentication Error",
        description: "Please sign in to access this area.",
        variant: "destructive",
      });
      router.push('/auth/admin-signin');
    }
  }

  async function fetchData() {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;

      setCategories(data || []);
    } catch (error) {
      logSupabaseError(error, "Fetching categories data");
      toast({
        title: "Error",
        description: "Failed to load data. Please try refreshing the page.",
        variant: "destructive",
      });
    }
  }

  async function handleDeleteCategory(id: string) {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { error } = await supabase
      .from("categories")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting category:", error);
      toast({
        title: "Error",
        description: "Failed to delete category",
        variant: "destructive",
      });
      return;
    }

    await fetchData();
  }

  const handleCreateCategory = () => {
    setSelectedCategory(null);
    setIsCategoryModalOpen(true);
  };

  const handleEditCategory = (category: Category) => {
    setSelectedCategory(category);
    setIsCategoryModalOpen(true);
  };

  const handleCloseCategoryModal = async () => {
    setIsCategoryModalOpen(false);
    await fetchData();
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Categories</h1>
        <Button onClick={handleCreateCategory}>
          <Plus className="h-4 w-4 mr-2" />
          Create Category
        </Button>
      </div>

      <div className="grid gap-4">
        {categories.map((category) => (
          <Card key={category.id} className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CategoryIcon
                  name={category.icon || "default"}
                  className="h-4 w-4"
                />
                <h3 className="font-semibold">{category.name}</h3>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleEditCategory(category)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteCategory(category.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {isCategoryModalOpen && (
        <CategoryForm
          category={selectedCategory}
          onClose={handleCloseCategoryModal}
          isOpen={isCategoryModalOpen}
        />
      )}
    </div>
  );
} 