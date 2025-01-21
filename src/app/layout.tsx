import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { RootProvider } from "@/components/providers/root-provider";
import { FooterWrapper } from "@/components/layout/footer-wrapper";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { ClientLayout } from "@/components/layout/client-layout";

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
            <ClientLayout>
              {children}
            </ClientLayout>
          </RootProvider>
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  );
}
