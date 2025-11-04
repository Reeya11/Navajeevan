// app/dashboard/layout.tsx
import Link from "next/link"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <div className="md:w-64 flex-shrink-0">
            <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
            <nav className="space-y-2">
              <Link href="/dashboard" className="block py-2 px-4 rounded-lg bg-accent text-accent-foreground">
                Overview
              </Link>
              <Link href="/dashboard/listings" className="block py-2 px-4 rounded-lg hover:bg-accent">
                My Listings
              </Link>
            </nav>
          </div>
          
          {/* Main Content */}
          <div className="flex-1">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}