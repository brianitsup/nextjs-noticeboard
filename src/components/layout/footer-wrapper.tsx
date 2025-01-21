"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { AdminFooter } from "@/components/ui/admin-footer"
import { Footer } from "@/components/ui/footer"
import { useSupabaseStatus } from "@/hooks/use-supabase-status"

export function FooterWrapper() {
  const pathname = usePathname()
  const isOnline = useSupabaseStatus()

  // Only show admin footer in admin routes
  if (!pathname.startsWith("/admin")) {
    return null
  }

  return <AdminFooter isOnline={isOnline} />
}

export function FooterWrapperLegacy() {
  return (
    <footer className="bg-white shadow">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <p className="text-center text-sm text-gray-500">
          © {new Date().getFullYear()} Notice Board. All rights reserved.
        </p>
      </div>
    </footer>
  );
} 