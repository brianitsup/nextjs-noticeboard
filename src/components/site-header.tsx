"use client"

import Link from "next/link"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme/theme-toggle"

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <Link href="/" className="font-bold hover:opacity-90">
          Notice Board
        </Link>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Link href="/create" passHref>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" /> Post a Notice
            </Button>
          </Link>
        </div>
      </div>
    </header>
  )
} 