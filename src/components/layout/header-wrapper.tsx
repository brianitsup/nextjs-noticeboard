"use client"

import { usePathname } from "next/navigation"
import { Header } from "@/components/ui/header"

export function HeaderWrapper() {
  const pathname = usePathname()
  const isAdminPage = pathname.startsWith('/admin')

  if (isAdminPage) {
    return null
  }

  return <Header />
}

export function HeaderWrapperOld() {
  return (
    <header className="bg-white shadow">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          Notice Board
        </h1>
      </div>
    </header>
  );
} 