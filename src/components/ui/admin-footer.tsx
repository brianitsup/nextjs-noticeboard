"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface AdminFooterProps extends React.HTMLAttributes<HTMLElement> {
  isOnline?: boolean;
}

export function AdminFooter({ className, isOnline }: AdminFooterProps) {
  return (
    <footer className={cn("border-t bg-background", className)}>
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Notice Board. All rights reserved.
          </p>
          <div className="flex items-center space-x-2">
            <div
              className={cn(
                "h-2 w-2 rounded-full",
                isOnline ? "bg-green-500" : "bg-red-500"
              )}
            />
            <span className="text-sm text-muted-foreground">
              {isOnline ? "Connected" : "Connection Error"}
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
} 