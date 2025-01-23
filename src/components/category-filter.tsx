"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
}

interface CategoryFilterProps {
  categories: Category[];
  selectedCategory?: string;
}

export function CategoryFilter({
  categories,
  selectedCategory,
}: CategoryFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = React.useState(searchParams.get("q") || "");
  const [sortBy, setSortBy] = React.useState(searchParams.get("sort") || "newest");

  const handleCategoryChange = (categoryId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (categoryId) {
      params.set("category", categoryId);
    } else {
      params.delete("category");
    }
    router.push(`/?${params.toString()}`);
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set("q", value);
    } else {
      params.delete("q");
    }
    router.push(`/?${params.toString()}`);
  };

  const handleSort = (value: string) => {
    setSortBy(value);
    const params = new URLSearchParams(searchParams.toString());
    if (value !== "newest") {
      params.set("sort", value);
    } else {
      params.delete("sort");
    }
    router.push(`/?${params.toString()}`);
  };

  return (
    <div className="flex flex-col space-y-6 lg:sticky lg:top-4 bg-background p-4 rounded-lg border lg:max-h-[calc(100vh-2rem)] lg:overflow-auto">
      {/* Search */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium leading-none">Search</h3>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search notices..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-9 w-full"
          />
        </div>
      </div>

      {/* Sort */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium leading-none">Sort by Date</h3>
        <Select value={sortBy} onValueChange={handleSort}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="oldest">Oldest First</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Categories */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium leading-none">Categories</h3>
        <div className="flex flex-col -mx-2">
          <Button
            variant={!selectedCategory ? "secondary" : "ghost"}
            className={cn(
              "justify-start font-normal rounded-none px-2",
              !selectedCategory && "bg-muted/50"
            )}
            onClick={() => handleCategoryChange("")}
          >
            <FileText className="mr-2 h-4 w-4" />
            All Notices
          </Button>
          {categories.map((category) => {
            // Dynamically import the icon based on the category's icon name
            const IconComponent = React.useMemo(() => {
              try {
                // Using dynamic import for Lucide icons
                return require(`lucide-react`)[category.icon] as LucideIcon;
              } catch (error) {
                return FileText;
              }
            }, [category.icon]);

            return (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "secondary" : "ghost"}
                className={cn(
                  "justify-start font-normal rounded-none px-2",
                  selectedCategory === category.id && "bg-muted/50"
                )}
                onClick={() => handleCategoryChange(category.id)}
              >
                <IconComponent className="mr-2 h-4 w-4" />
                {category.name}
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
} 