import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { RootProvider } from "@/components/providers/root-provider";
import { HeaderWrapper } from "@/components/layout/header-wrapper";
import { FooterWrapper } from "@/components/layout/footer-wrapper";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { SiteHeader } from "@/components/site-header";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Notice Board - Public Announcements & Ads",
  description: "A digital notice board for public announcements, advertisements, and promotions",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} antialiased min-h-screen flex flex-col`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <RootProvider>
            <SiteHeader />
            <div className="flex-1">
              <HeaderWrapper />
              {children}
            </div>
            <FooterWrapper>
              <footer className="bg-white shadow">
                <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                  <p className="text-center text-sm text-gray-500">
                    © {new Date().getFullYear()} Notice Board. All rights reserved.
                  </p>
                </div>
              </footer>
            </FooterWrapper>
          </RootProvider>
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  );
}
