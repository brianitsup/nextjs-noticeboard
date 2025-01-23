"use client"

import { 
  FileText,
  Bell,
  Calendar,
  MessageCircle,
  AlertCircle,
  Info,
  Star,
  BookOpen,
  Megaphone
} from "lucide-react"

type IconComponent = typeof FileText;

const iconMap: Record<string, IconComponent> = {
  FileText,
  Bell,
  Calendar,
  MessageCircle,
  AlertCircle,
  Info,
  Star,
  BookOpen,
  Megaphone
};

interface CategoryIconProps {
  name: string;
  className?: string;
}

export function CategoryIcon({ name, className = "h-4 w-4" }: CategoryIconProps) {
  const Icon = iconMap[name] || FileText;
  return <Icon className={className} />;
}

export function getCategoryIcon(iconName: string) {
  const Icon = iconMap[iconName] || FileText;
  return <Icon className="h-4 w-4" />;
} 