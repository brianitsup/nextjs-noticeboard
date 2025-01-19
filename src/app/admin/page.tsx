"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Eye, EyeOff, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import type { Notice, Category } from "@/types/notice";
import { NoticeForm } from "@/components/notice-form";
import { CategoryForm } from "@/components/admin/category-form";
import { formatDate } from "@/lib/date-utils";

export default function AdminDashboard() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  useEffect(() => {
    fetchNotices();
    fetchCategories();
  }, []);

  async function fetchNotices() {
    const { data: noticesData, error: noticesError } = await supabase
      .from("notices")
      .select(`
        *,
        category:categories(*)
      `)
      .order("posted_at", { ascending: false });

    if (noticesError) {
      console.error("Error fetching notices:", noticesError);
      return;
    }

    setNotices(noticesData.map(notice => ({
      ...notice,
      postedAt: notice.posted_at,
      expiresAt: notice.expires_at,
      isSponsored: notice.is_sponsored
    })));
  }

  async function fetchCategories() {
    const { data: categoriesData, error: categoriesError } = await supabase
      .from("categories")
      .select("*")
      .order("name", { ascending: true });

    if (categoriesError) {
      console.error("Error fetching categories:", categoriesError);
      return;
    }

    setCategories(categoriesData);
  }

  async function handleDeleteNotice(id: string) {
    const { error } = await supabase
      .from("notices")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting notice:", error);
      return;
    }

    fetchNotices();
  }

  async function handleDeleteCategory(id: string) {
    const { error } = await supabase
      .from("categories")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting category:", error);
      return;
    }

    fetchCategories();
    // Refresh notices as they might be affected by category deletion
    fetchNotices();
  }

  async function handleTogglePublish(notice: Notice) {
    const { error } = await supabase
      .from("notices")
      .update({ published: !notice.published })
      .eq("id", notice.id);

    if (error) {
      console.error("Error toggling notice publish state:", error);
      return;
    }

    fetchNotices();
  }

  async function handleToggleSponsored(notice: Notice) {
    const { error } = await supabase
      .from("notices")
      .update({ is_sponsored: !notice.is_sponsored })
      .eq("id", notice.id);

    if (error) {
      console.error("Error toggling notice sponsored state:", error);
      return;
    }

    fetchNotices();
  }

  const handleCreateNotice = () => {
    setSelectedNotice(null);
    setIsCreateModalOpen(true);
  };

  const handleCreateCategory = () => {
    setSelectedCategory(null);
    setIsCategoryModalOpen(true);
  };

  const handleEditNotice = (notice: Notice) => {
    setSelectedNotice(notice);
    setIsCreateModalOpen(true);
  };

  const handleEditCategory = (category: Category) => {
    setSelectedCategory(category);
    setIsCategoryModalOpen(true);
  };

  const handleCloseNoticeModal = () => {
    setIsCreateModalOpen(false);
    setSelectedNotice(null);
    fetchNotices();
  };

  const handleCloseCategoryModal = () => {
    setIsCategoryModalOpen(false);
    setSelectedCategory(null);
    fetchCategories();
  };

  return (
    <div className="space-y-8">
      <div>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Manage Notices</h2>
          <Button onClick={handleCreateNotice} className="flex items-center gap-2">
            <Plus className="h-4 w-4" /> Create Notice
          </Button>
        </div>

        <div className="rounded-lg border">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Posted At
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Sponsored
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {notices.map((notice) => (
                  <tr key={notice.id}>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {notice.title}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="text-sm text-gray-500">
                        {typeof notice.category === 'string' 
                          ? notice.category 
                          : notice.category?.name ?? 'Unknown'}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="text-sm text-gray-500">
                        {notice.postedAt ? formatDate(notice.postedAt) : 'N/A'}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="text-sm text-gray-500">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleTogglePublish(notice)}
                          className={notice.published ? "text-green-600" : "text-gray-400"}
                        >
                          {notice.published ? (
                            <Eye className="h-4 w-4" />
                          ) : (
                            <EyeOff className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="text-sm text-gray-500">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleSponsored(notice)}
                          className={notice.is_sponsored ? "text-yellow-500" : "text-gray-400"}
                        >
                          <Sparkles className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditNotice(notice)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteNotice(notice.id)}
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
        </div>
      </div>

      <div>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Manage Categories</h2>
          <Button onClick={handleCreateCategory} className="flex items-center gap-2">
            <Plus className="h-4 w-4" /> Create Category
          </Button>
        </div>

        <div className="rounded-lg border">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Icon
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {categories.map((category) => (
                  <tr key={category.id}>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {category.name}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500">
                        {category.description}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="text-sm text-gray-500">
                        {category.icon}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditCategory(category)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteCategory(category.id)}
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
        </div>
      </div>

      {isCreateModalOpen && (
        <NoticeForm
          notice={selectedNotice}
          onClose={handleCloseNoticeModal}
          categories={categories}
        />
      )}

      {isCategoryModalOpen && (
        <CategoryForm
          category={selectedCategory}
          onClose={handleCloseCategoryModal}
        />
      )}
    </div>
  );
} 