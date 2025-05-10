
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
// import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"; // Removed
// import { AppSidebar } from "@/components/layout/app-sidebar"; // Removed
import AppHeader from "@/components/layout/app-header";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Prompt Studio",
  description: "An advanced studio for customizing and generating AI prompts.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
        suppressHydrationWarning={true}
      >
        <div className="flex flex-col min-h-screen w-full">
          <AppHeader />
          <main className="flex-1 overflow-y-auto p-4 md:p-6">
            {children}
          </main>
        </div>
        <Toaster />
      </body>
    </html>
  );
}
