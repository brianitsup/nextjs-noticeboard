"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { FacebookIcon, LinkedInIcon, XIcon } from "@/components/ui/social-icons"

export function Footer({ className }: React.HTMLAttributes<HTMLElement>) {
  return (
    <footer className={cn("border-t bg-background", className)}>
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
                <a href="/about" className="hover:text-foreground">
                  About
                </a>
              </li>
              <li>
                <a href="/blog" className="hover:text-foreground">
                  Blog
                </a>
              </li>
              <li>
                <a href="/pricing" className="hover:text-foreground">
                  Pricing
                </a>
              </li>
            </ul>
          </div>

          {/* Socials */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Socials</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a 
                  href="#" 
                  className="flex items-center gap-2 hover:text-foreground transition-colors"
                  aria-label="Facebook"
                >
                  <FacebookIcon />
                  <span>Facebook</span>
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  className="flex items-center gap-2 hover:text-foreground transition-colors"
                  aria-label="LinkedIn"
                >
                  <LinkedInIcon />
                  <span>LinkedIn</span>
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  className="flex items-center gap-2 hover:text-foreground transition-colors"
                  aria-label="X (formerly Twitter)"
                >
                  <XIcon />
                  <span>X (Twitter)</span>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  )
} 