"use client"

import * as React from "react"
import { createAuthClient } from "@/lib/supabase"
import { cn } from "@/lib/utils"

export function AdminFooter({ className }: React.HTMLAttributes<HTMLElement>) {
  const [isOnline, setIsOnline] = React.useState(true)
  const supabase = createAuthClient()

  React.useEffect(() => {
    const checkConnection = async () => {
      try {
        const { data } = await supabase.from("notices").select("id").limit(1)
        setIsOnline(true)
      } catch (error) {
        setIsOnline(false)
      }
    }

    // Check initial connection
    checkConnection()

    // Set up periodic checks
    const interval = setInterval(checkConnection, 30000) // Check every 30 seconds

    return () => clearInterval(interval)
  }, [supabase])

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