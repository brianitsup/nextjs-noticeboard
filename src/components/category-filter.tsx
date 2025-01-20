"use client";

import { Category } from "@/types/notice";
import { Button } from "@/components/ui/button";
import { getCategoryIcon } from "@/components/ui/category-icon";

interface CategoryFilterProps {
  categories: Category[];
  selectedCategory: string | null;
  onChange: (categoryId: string | null) => void;
}

export function CategoryFilter({
  categories,
  selectedCategory,
  onChange,
}: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant={selectedCategory === null ? "default" : "outline"}
        onClick={() => onChange(null)}
      >
        All
      </Button>
      {categories.map((category) => (
        <Button
          key={category.id}
          variant={selectedCategory === category.id ? "default" : "outline"}
          onClick={() => onChange(category.id)}
          className="flex items-center gap-2"
        >
          {getCategoryIcon(category.icon)}
          {category.name}
        </Button>
      ))}
    </div>
  );
} 