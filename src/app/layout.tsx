import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { createAuthClient } from "@/lib/supabase";
import { Toaster } from "@/components/ui/toaster";
import { Footer } from "@/components/ui/footer";
import { HeaderWrapper } from "@/components/layout/header-wrapper";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Notice Board - Public Announcements & Ads",
  description: "A digital notice board for public announcements, advertisements, and promotions",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = createAuthClient();

  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased min-h-screen flex flex-col`}>
        <div className="flex-1">
          <HeaderWrapper />
          {children}
        </div>
        <Footer />
        <Toaster />
      </body>
    </html>
  );
}
