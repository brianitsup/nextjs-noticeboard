"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { AdminFooter } from "@/components/ui/admin-footer"
import { Footer } from "@/components/ui/footer"
import { createAuthClient } from "@/lib/supabase"

export function FooterWrapper() {
  const pathname = usePathname()
  const isAdminPage = pathname.startsWith('/admin')
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
    <>
      {!isAdminPage && <Footer />}
      <AdminFooter isOnline={isOnline} />
    </>
  )
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