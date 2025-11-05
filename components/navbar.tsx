// components/navbar.tsx
'use client';

import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { MessageCircle, User, Package, LogOut, Bell, Settings, ArrowLeft, Home, Heart } from "lucide-react" // Added Heart icon
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"
import { useState } from "react"

export function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const { user, logout, isLoading } = useAuth()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [savedItemsCount, setSavedItemsCount] = useState(3) // Example count for saved items

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await logout()
      window.location.href = '/'
    } catch (error) {
      console.error('Logout failed:', error)
      setIsLoggingOut(false)
    }
  }

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back()
    } else {
      router.push('/')
    }
  }

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <nav className="bg-background border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="animate-pulse bg-muted h-8 w-8 rounded-full"></div>
              <div className="animate-pulse bg-muted h-8 w-8 rounded-full"></div>
              <div className="animate-pulse bg-muted h-8 w-32 rounded"></div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="animate-pulse bg-muted h-9 w-24 rounded"></div>
              <div className="animate-pulse bg-muted h-9 w-24 rounded"></div>
            </div>
          </div>
        </div>
      </nav>
    )
  }

  return (
    <nav className="bg-background border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left side: Navigation controls */}
          <div className="flex items-center space-x-4">
            {/* Back Button - Only show when not on home page */}
            {pathname !== '/' && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBack}
                className="h-8 w-8 rounded-full"
                aria-label="Go back"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            
            {/* Home Button - Always visible for quick access */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push('/')}
              className="h-8 w-8 rounded-full"
              aria-label="Go to home"
            >
              <Home className="h-4 w-4" />
            </Button>

            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <Package className="h-8 w-8 text-accent" />
              <span className="text-xl font-bold text-foreground hidden sm:block">NavaJeevan</span>
            </Link>
          </div>

          {/* Center: Navigation Links - Always visible */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              href="/browse" 
              className={`transition-colors ${pathname === '/browse' ? 'text-accent font-medium' : 'text-foreground hover:text-accent'}`}
            >
              Browse
            </Link>
            
            {/* Show Dashboard link ONLY if logged in */}
            {user && (
              <Link 
                href="/dashboard" 
                className={`transition-colors ${pathname === '/dashboard' ? 'text-accent font-medium' : 'text-foreground hover:text-accent'}`}
              >
                Dashboard
              </Link>
            )}
            
            <Link
              href="/messages"
              className={`flex items-center space-x-1 transition-colors ${pathname === '/messages' ? 'text-accent font-medium' : 'text-foreground hover:text-accent'}`}
            >
              <MessageCircle className="h-4 w-4" />
              <span>Messages</span>
            </Link>

            {/* Categories dropdown or link */}
            <Link 
              href="/categories" 
              className={`transition-colors ${pathname === '/categories' ? 'text-accent font-medium' : 'text-foreground hover:text-accent'}`}
            >
              Categories
            </Link>
          </div>

          {/* Right side: Auth Buttons and Sell Item Button */}
          <div className="flex items-center space-x-4">
            {user ? (
              // USER IS LOGGED IN - Show personalized menu
              <div className="flex items-center gap-4">
                {/* FAVORITES/SAVED ITEMS - Replaced Notification Bell */}
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="relative text-amber-700 hover:text-amber-800 hover:bg-amber-50"
                  onClick={() => router.push('/favorites')}
                  aria-label="Saved items"
                >
                  <Heart className="h-5 w-5" />
                  {savedItemsCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-amber-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {savedItemsCount}
                    </span>
                  )}
                </Button>

                {/* User Profile Dropdown (simplified) */}
                <div className="flex items-center gap-3">
                  <div className="bg-accent/10 w-8 h-8 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-accent">
                      {user.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="hidden sm:block">
                    <p className="text-sm font-medium">Hi, {user.name}!</p>
                  </div>
                </div>

                {/* Settings */}
                <Button variant="ghost" size="icon" onClick={() => router.push('/settings')}>
                  <Settings className="h-5 w-5" />
                </Button>

                {/* Logout */}
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  {isLoggingOut ? 'Logging out...' : 'Logout'}
                </Button>
              </div>
            ) : (
              // USER IS NOT LOGGED IN - Show auth buttons
              <div className="flex items-center gap-3">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => router.push('/login')}
                >
                  <User className="h-4 w-4 mr-2" />
                  Login
                </Button>
                
                <Button 
                  size="sm" 
                  className="bg-accent hover:bg-accent/90"
                  onClick={() => router.push('/register')}
                >
                  Sign Up
                </Button>
              </div>
            )}

            {/* Sell Item Button (visible to all) */}
            <Button 
              size="sm" 
              className="bg-green-600 hover:bg-green-700"
              onClick={() => router.push(user ? '/sell' : '/login')}
            >
              Sell Item
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}