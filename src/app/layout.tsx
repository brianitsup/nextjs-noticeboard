import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { RootProvider } from "@/components/providers/root-provider";
import { HeaderWrapper } from "@/components/layout/header-wrapper";
import { FooterWrapper } from "@/components/layout/footer-wrapper";
import { ThemeProvider } from "@/components/theme/theme-provider"

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
            <div className="flex-1">
              <HeaderWrapper />
              {children}
            </div>
            <FooterWrapper />
          </RootProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
