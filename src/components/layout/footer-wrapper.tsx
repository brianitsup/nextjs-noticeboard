"use client"

import { usePathname } from "next/navigation"
import { Footer } from "@/components/ui/footer"
import { AdminFooter } from "@/components/ui/admin-footer"

export function FooterWrapper() {
  const pathname = usePathname()
  const isAdminPage = pathname.startsWith('/admin')

  return isAdminPage ? <AdminFooter /> : <Footer />
} 