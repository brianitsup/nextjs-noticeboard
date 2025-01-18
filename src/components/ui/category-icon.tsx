"use client"

import * as React from "react"
import { Bell, Megaphone, AlertCircle, Calendar } from "lucide-react"
import { Notice } from "@/types/notice"

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