"use client";

import { usePathname } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { FooterWrapper } from "@/components/layout/footer-wrapper";

interface ClientLayoutProps {
  children: React.ReactNode;
}

export function ClientLayout({ children }: ClientLayoutProps) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin');

  return (
    <>
      {!isAdminRoute && <SiteHeader />}
      <div className="flex-1">
        {children}
      </div>
      <FooterWrapper />
    </>
  );
} 