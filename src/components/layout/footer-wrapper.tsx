"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { AdminFooter } from "@/components/ui/admin-footer"
import { Footer } from "@/components/ui/footer"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"

export function FooterWrapper({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = React.useState(true)
  const supabase = createClient()
  const { toast } = useToast()
  const router = useRouter()

  React.useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
          router.push("/auth/sign-in")
          return
        }
        setIsLoading(false)
      } catch (error) {
        console.error("Auth check error:", error)
        toast({
          title: "Error",
          description: "Failed to verify authentication status",
          variant: "destructive",
        })
        router.push("/auth/sign-in")
      }
    }

    checkAuth()
  }, [router, toast])

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  return <>{children}</>
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