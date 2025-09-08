// app/dashboard/page.tsx
'use client';

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, MessageCircle, User, Plus, Loader, AlertCircle } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"

// Interface for user stats
interface UserStats {
  totalListings: number;
  activeListings: number;
  totalMessages: number;
  soldItems: number;
}

// Interface for recent activity
interface RecentActivity {
  id: string;
  type: string;
  title: string;
  description: string;
  timestamp: string;
  link: string;
}

export default function DashboardPage() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [userStats, setUserStats] = useState<UserStats>({
    totalListings: 0,
    activeListings: 0,
    totalMessages: 0,
    soldItems: 0
  })
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return
      
      try {
        setIsLoading(true)
        setError(null)
        
        // Fetch user stats
        const statsResponse = await fetch('/api/user/stats')
        if (statsResponse.ok) {
          const statsData = await statsResponse.json()
          setUserStats(statsData)
        }
        
        // Fetch recent activity
        const activityResponse = await fetch('/api/user/activity')
        if (activityResponse.ok) {
          const activityData = await activityResponse.json()
          setRecentActivity(activityData)
        }
        
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error)
        setError('Failed to load dashboard data')
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [user])

  // Show loading state
  if (authLoading || isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-64">
          <Loader className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-64">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 text-destructive">
                <AlertCircle className="h-6 w-6" />
                <p>{error}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back{user?.name ? `, ${user.name}` : ''}! Here's your activity overview.
          </p>
        </div>
        <Button asChild className="bg-accent hover:bg-accent/90">
          <Link href="/sell">
            <Plus className="h-4 w-4 mr-2" />
            Sell New Item
          </Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Listings</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats.totalListings}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {userStats.activeListings} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Listings</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats.activeListings}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {userStats.totalListings > 0 
                ? `${Math.round((userStats.activeListings / userStats.totalListings) * 100)}% active`
                : 'No listings'
              }
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Messages</CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats.totalMessages}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Unread: 3
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sold Items</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats.soldItems}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {userStats.totalListings > 0 
                ? `${Math.round((userStats.soldItems / userStats.totalListings) * 100)}% sold rate`
                : 'No sales yet'
              }
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Section */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Your latest marketplace interactions</CardDescription>
        </CardHeader>
        <CardContent>
          {recentActivity.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No recent activity
            </div>
          ) : (
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex-1">
                    <p className="font-medium">{activity.title}</p>
                    <p className="text-sm text-muted-foreground">{activity.timestamp}</p>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={activity.link}>
                      View
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}