import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { HeaderWrapper } from "@/components/layout/header-wrapper";
import { FooterWrapper } from "@/components/layout/footer-wrapper";
import { AuthProvider } from "@/components/auth-provider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Notice Board - Public Announcements & Ads",
  description: "A digital notice board for public announcements, advertisements, and promotions",
};

function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <div className="flex-1">
        <HeaderWrapper />
        {children}
      </div>
      <FooterWrapper />
      <Toaster />
    </AuthProvider>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased min-h-screen flex flex-col`}>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
