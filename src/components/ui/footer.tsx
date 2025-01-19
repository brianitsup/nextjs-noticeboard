"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Facebook, Linkedin, Twitter } from "lucide-react"

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
            <div className="flex space-x-4">
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a 
                href="https://linkedin.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground"
              >
                <Linkedin className="h-5 w-5" />
              </a>
              <a 
                href="https://x.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground"
              >
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
} 