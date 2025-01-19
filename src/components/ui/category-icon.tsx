"use client"

import * as React from "react"
import { 
  AlertCircle,
  AlertTriangle,
  Bell,
  FileText,
  Info,
  ListTodo,
  LucideIcon,
  Megaphone,
  Newspaper,
  RefreshCw,
  Calendar
} from "lucide-react"
import { Notice } from "@/types/notice"
import { getStandardIconName } from "@/lib/categories"

// Map of icon names to Lucide icon components
const iconComponents: Record<string, LucideIcon> = {
  AlertCircle,
  AlertTriangle,
  Bell,
  Calendar,
  FileText,
  Info,
  ListTodo,
  Megaphone,
  Newspaper,
  RefreshCw
}

export function getCategoryIcon(category: Notice['category']) {
  if (!category) return null;
  
  const categoryName = typeof category === 'string' ? category : category.name;
  const iconName = getStandardIconName(categoryName)
  const IconComponent = iconComponents[iconName]
  
  return IconComponent ? <IconComponent className="h-4 w-4" /> : <FileText className="h-4 w-4" />
} 