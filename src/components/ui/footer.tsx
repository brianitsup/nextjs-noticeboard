"use client"

import * as React from "react"
import { createAuthClient } from "@/lib/supabase"
import { combineStyles } from "@/lib/style-utils"

export function Footer({ className }: React.HTMLAttributes<HTMLElement>) {
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
    <footer className={combineStyles("border-t bg-background", className)}>
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {/* About Section */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Notice Board</h3>
            <p className="text-sm text-muted-foreground">
              A digital platform for public announcements, advertisements, and community updates.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Quick Links</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="/" className="hover:text-foreground">
                  Home
                </a>
              </li>
              <li>
                <a href="/about" className="hover:text-foreground">
                  About
                </a>
              </li>
              <li>
                <a href="/contact" className="hover:text-foreground">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Status Section */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">System Status</h3>
            <div className="flex items-center space-x-2">
              <div
                className={combineStyles(
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

        {/* Copyright */}
        <div className="mt-8 border-t pt-6">
          <p className="text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} Notice Board. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
} 