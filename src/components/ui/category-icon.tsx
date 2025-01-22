"use client"

import * as React from "react"
import * as Icons from "lucide-react"
import { LucideIcon } from "lucide-react"
import { Notice } from "@/types/notice"
import { getStandardIconName } from "@/lib/categories"

interface CategoryIconProps {
  name: string;
  className?: string;
}

export function CategoryIcon({ name, className = "h-4 w-4" }: CategoryIconProps) {
  // Get the icon component from Lucide icons
  const IconComponent = (Icons[name as keyof typeof Icons] || Icons.HelpCircle) as LucideIcon
  return React.createElement(IconComponent, { className })
}

export function getCategoryIcon(iconName: string) {
  return <CategoryIcon name={iconName} />
} 