import type React from "react"
import type { Metadata } from "next"
import { DM_Sans } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import "./globals.css"
import { AuthProvider } from '@/contexts/AuthContext';
import { Navbar } from "@/components/navbar"

const dmSans = DM_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-dm-sans",
})

export const metadata: Metadata = {
  title: "NavaJeevan - Give Items a New Life",
  description: "A community-driven second-hand marketplace where items find new purpose",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${dmSans.variable} antialiased`}>
        <AuthProvider> <Navbar></Navbar>{/* Wrap everything with AuthProvider */}
          <Suspense fallback={null}>
            {children}
          </Suspense>
          <Analytics />
        </AuthProvider>
      </body>
    </html>
  )
}