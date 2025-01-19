"use client"

import { usePathname } from "next/navigation"
import { Footer } from "@/components/ui/footer"
import { AdminFooter } from "@/components/ui/admin-footer"

export function FooterWrapper() {
  const pathname = usePathname()
  const isAdminPage = pathname.startsWith('/admin')

  return isAdminPage ? <AdminFooter /> : <Footer />
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