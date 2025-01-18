"use client"

import * as React from "react"
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { Bell, Megaphone, AlertCircle, Calendar, Sparkles } from "lucide-react"
import { Notice } from "@/types/notice"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getCategoryIcon(category: Notice['category']) {
  switch (category) {
    case 'announcement':
      return <Bell className="h-4 w-4" />;
    case 'advertisement':
      return <Megaphone className="h-4 w-4" />;
    case 'promotion':
      return <AlertCircle className="h-4 w-4" />;
    case 'event':
      return <Calendar className="h-4 w-4" />;
  }
} 