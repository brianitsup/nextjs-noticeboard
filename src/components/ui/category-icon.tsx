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
  Calendar,
  HelpCircle,
  Flag,
  MessageCircle,
  Star,
  Users
} from "lucide-react"
import { Notice } from "@/types/notice"
import { getStandardIconName } from "@/lib/categories"

interface CategoryIconProps {
  name: string;
  className?: string;
}

// Map of icon names to Lucide icon components
const iconComponents: Record<string, LucideIcon> = {
  alert: AlertCircle,
  announcement: Bell,
  event: Calendar,
  general: FileText,
  important: Flag,
  help: HelpCircle,
  info: Info,
  discussion: MessageCircle,
  featured: Star,
  community: Users,
}

export function CategoryIcon({ name, className = "h-4 w-4" }: CategoryIconProps) {
  const Icon = iconComponents[name] || Info;
  return <Icon className={className} />;
}

export function getCategoryIcon(iconName: string) {
  // Convert the icon name to match the standardized category names
  const standardizedName = iconName.toLowerCase();
  const Icon = iconComponents[standardizedName] || Info;
  return <Icon className="h-4 w-4" />;
} 