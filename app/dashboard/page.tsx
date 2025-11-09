// app/dashboard/page.tsx - SIMPLIFIED BEAUTIFUL VERSION
'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface DashboardStats {
  activeListings: number;
  totalViews: number;
  unreadMessages: number;
  totalListingsValue: number;
}

interface Listing {
  _id: string;
  title: string;
  price: number;
  images: string[];
  condition: string;
  city: string;
  createdAt: string;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentListings, setRecentListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      const [statsRes, listingsRes] = await Promise.all([
        fetch('/api/dashboard/stats'),
        fetch('/api/dashboard/listings')
      ]);

      const [statsData, listingsData] = await Promise.all([
        statsRes.json(),
        listingsRes.json()
      ]);

      setStats(statsData);
      setRecentListings(listingsData.listings?.slice(0, 3) || []); // Only show 3 recent listings

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600 mt-1">Welcome back, {user?.name}!</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards Grid */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Active Listings Card */}
            <a 
              href="/dashboard/listings" 
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-lg hover:border-green-300 transition-all cursor-pointer group"
            >
              <div className="flex items-center">
                <div className="bg-green-100 p-4 rounded-xl group-hover:bg-green-200 transition-colors">
                  <span className="text-2xl">📦</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Listings</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.activeListings}</p>
                </div>
              </div>
            </a>

            {/* Total Views Card */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center">
                <div className="bg-blue-100 p-4 rounded-xl">
                  <span className="text-2xl">👀</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Views</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalViews}</p>
                </div>
              </div>
            </div>

            {/* Messages Card */}
            <a 
              href="/messages" 
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-lg hover:border-amber-300 transition-all cursor-pointer group"
            >
              <div className="flex items-center">
                <div className="bg-amber-100 p-4 rounded-xl group-hover:bg-amber-200 transition-colors">
                  <span className="text-2xl">💬</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Messages</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.unreadMessages}</p>
                </div>
              </div>
            </a>

            {/* Total Value Card */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center">
                <div className="bg-purple-100 p-4 rounded-xl">
                  <span className="text-2xl">💰</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Value</p>
                  <p className="text-2xl font-bold text-gray-900">Rs. {stats.totalListingsValue?.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions - Left Side */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
              <div className="space-y-4">
                <a href="/sell" className="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors group">
                  <div className="bg-green-100 p-3 rounded-lg group-hover:bg-green-200 transition-colors">
                    <span className="text-xl">➕</span>
                  </div>
                  <div className="ml-4">
                    <p className="font-semibold text-green-800">Sell New Item</p>
                    <p className="text-sm text-green-600">List your item for sale</p>
                  </div>
                </a>

                <a href="/dashboard/listings" className="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors group">
                  <div className="bg-blue-100 p-3 rounded-lg group-hover:bg-blue-200 transition-colors">
                    <span className="text-xl">📋</span>
                  </div>
                  <div className="ml-4">
                    <p className="font-semibold text-blue-800">My Listings</p>
                    <p className="text-sm text-blue-600">Manage your items</p>
                  </div>
                </a>

                <a href="/favorites" className="flex items-center p-4 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors group">
                  <div className="bg-amber-100 p-3 rounded-lg group-hover:bg-amber-200 transition-colors">
                    <span className="text-xl">❤️</span>
                  </div>
                  <div className="ml-4">
                    <p className="font-semibold text-amber-800">Saved Items</p>
                    <p className="text-sm text-amber-600">Your favorite items</p>
                  </div>
                </a>

                <a href="/settings" className="flex items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors group">
                  <div className="bg-purple-100 p-3 rounded-lg group-hover:bg-purple-200 transition-colors">
                    <span className="text-xl">⚙️</span>
                  </div>
                  <div className="ml-4">
                    <p className="font-semibold text-purple-800">Settings</p>
                    <p className="text-sm text-purple-600">Account preferences</p>
                  </div>
                </a>
              </div>
            </div>
          </div>

          {/* Recent Listings - Right Side */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Recent Listings</h2>
                <a 
                  href="/dashboard/listings"
                  className="text-green-600 hover:text-green-700 font-medium"
                >
                  View All →
                </a>
              </div>

              {recentListings.length > 0 ? (
                <div className="space-y-4">
                  {recentListings.map((listing) => (
                    <div key={listing._id} className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-green-300 transition-colors">
                      <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                        {listing.images && listing.images.length > 0 ? (
                          <img 
                            src={listing.images[0]} 
                            alt={listing.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-xl">📦</span>
                        )}
                      </div>
                      <div className="ml-4 flex-1">
                        <h3 className="font-semibold text-gray-900">{listing.title}</h3>
                        <div className="flex items-center space-x-4 mt-1">
                          <p className="text-green-600 font-bold">Rs. {listing.price.toLocaleString()}</p>
                          <span className="text-sm text-gray-600 capitalize">{listing.condition}</span>
                          <span className="text-sm text-gray-600">{listing.city}</span>
                        </div>
                      </div>
                      <a 
                        href={`/item/${listing._id}`}
                        className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                      >
                        View
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <span className="text-4xl block mb-4">📦</span>
                  <p className="text-gray-600 mb-4">You haven't listed any items yet</p>
                  <a 
                    href="/sell"
                    className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors inline-block"
                  >
                    List Your First Item
                  </a>
                </div>
              )}
            </div>

            {/* Browse Marketplace Card */}
            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-sm p-6 mt-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold mb-2">Browse Marketplace</h3>
                  <p className="text-green-100">Discover amazing items from other sellers</p>
                </div>
                <a 
                  href="/browse"
                  className="bg-white text-green-600 px-6 py-2 rounded-lg font-semibold hover:bg-green-50 transition-colors"
                >
                  Explore Now
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}