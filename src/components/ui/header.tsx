"use client"

import Link from "next/link"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Header() {
  return (
    <header className="border-b">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-3xl font-bold hover:opacity-90">
            Notice Board
          </Link>
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