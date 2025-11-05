// app/dashboard/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface DashboardStats {
  activeListings: number;
  totalViews: number;
  unreadMessages: number;
  totalEarnings: number;
}

interface Listing {
  _id: string;
  title: string;
  price: number;
  images: string[];
  status: 'active' | 'sold' | 'draft';
  views: number;
  createdAt: string;
}

interface SavedItem {
  _id: string;
  title: string;
  price: number;
  images: string[];
  savedAt: string;
}

interface Activity {
  _id: string;
  type: 'view' | 'message' | 'sale';
  message: string;
  itemId: string;
  createdAt: string;
  amount?: number;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch all data in parallel
      const [statsRes, listingsRes, savedRes, activitiesRes] = await Promise.all([
        fetch('/api/dashboard/stats'),
        fetch('/api/dashboard/listings'),
        fetch('/api/dashboard/saved-items'),
        fetch('/api/dashboard/activities')
      ]);

      const [statsData, listingsData, savedData, activitiesData] = await Promise.all([
        statsRes.json(),
        listingsRes.json(),
        savedRes.json(),
        activitiesRes.json()
      ]);

      setStats(statsData);
      setListings(listingsData.listings || []);
      setSavedItems(savedData.savedItems || []);
      setActivities(activitiesData.activities || []);

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
        {/* Quick Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <div className="flex items-center">
                <div className="bg-green-100 p-3 rounded-lg">
                  <span className="text-2xl">📦</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Listings</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.activeListings}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <div className="flex items-center">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <span className="text-2xl">👀</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Views</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalViews}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <div className="flex items-center">
                <div className="bg-amber-100 p-3 rounded-lg">
                  <span className="text-2xl">💬</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Unread Messages</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.unreadMessages}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <div className="flex items-center">
                <div className="bg-purple-100 p-3 rounded-lg">
                  <span className="text-2xl">💰</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Earnings</p>
                  <p className="text-2xl font-bold text-gray-900">NPR {stats.totalEarnings?.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              {['overview', 'listings', 'saved', 'activity'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 px-6 text-sm font-medium border-b-2 ${
                    activeTab === tab
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab === 'overview' && '📊 Overview'}
                  {tab === 'listings' && '🏷️ My Listings'}
                  {tab === 'saved' && '❤️ Saved Items'}
                  {tab === 'activity' && '📈 Activity'}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <OverviewTab 
                activities={activities} 
                onRefresh={fetchDashboardData}
              />
            )}
            {activeTab === 'listings' && (
              <ListingsTab 
                listings={listings} 
                onRefresh={fetchDashboardData}
              />
            )}
            {activeTab === 'saved' && (
              <SavedTab 
                savedItems={savedItems} 
                onRefresh={fetchDashboardData}
              />
            )}
            {activeTab === 'activity' && (
              <ActivityTab activities={activities} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Tab Components with Real Data
function OverviewTab({ activities, onRefresh }: { activities: Activity[], onRefresh: () => void }) {
  return (
    <div className="space-y-6">
      {/* Recent Activity */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        {activities.length > 0 ? (
          <div className="space-y-3">
            {activities.slice(0, 5).map((activity) => (
              <div key={activity._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{activity.message}</p>
                  <p className="text-sm text-gray-600">
                    {new Date(activity.createdAt).toLocaleDateString()}
                  </p>
                </div>
                {activity.amount && (
                  <span className="text-green-600 font-bold">+NPR {activity.amount}</span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600 text-center py-4">No recent activity</p>
        )}
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <a href="/sell" className="p-4 bg-green-50 rounded-lg text-center hover:bg-green-100 transition-colors block">
            <span className="text-2xl block mb-2">➕</span>
            <span className="text-sm font-medium text-green-800">Sell Item</span>
          </a>
          <a href="/profile" className="p-4 bg-blue-50 rounded-lg text-center hover:bg-blue-100 transition-colors block">
            <span className="text-2xl block mb-2">✏️</span>
            <span className="text-sm font-medium text-blue-800">Edit Profile</span>
          </a>
          <button 
            onClick={() => window.location.href = '/favorites'}
            className="p-4 bg-amber-50 rounded-lg text-center hover:bg-amber-100 transition-colors"
          >
            <span className="text-2xl block mb-2">❤️</span>
            <span className="text-sm font-medium text-amber-800">Saved Items</span>
          </button>
          <a href="/settings" className="p-4 bg-purple-50 rounded-lg text-center hover:bg-purple-100 transition-colors block">
            <span className="text-2xl block mb-2">⚙️</span>
            <span className="text-sm font-medium text-purple-800">Settings</span>
          </a>
        </div>
      </div>
    </div>
  );
}

function ListingsTab({ listings, onRefresh }: { listings: Listing[], onRefresh: () => void }) {
  const deleteListing = async (listingId: string) => {
    try {
      await fetch(`/api/items/${listingId}`, { method: 'DELETE' });
      onRefresh(); // Refresh data
    } catch (error) {
      console.error('Error deleting listing:', error);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">My Listings</h3>
        <a 
          href="/sell"
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
        >
          ➕ Add New Listing
        </a>
      </div>
      
      {listings.length > 0 ? (
        <div className="space-y-4">
          {listings.map((listing) => (
            <div key={listing._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                  {listing.images && listing.images.length > 0 ? (
                    <img 
                      src={listing.images[0]} 
                      alt={listing.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl">📦</span>
                  )}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{listing.title}</h4>
                  <p className="text-green-600 font-bold">NPR {listing.price.toLocaleString()}</p>
                  <div className="flex space-x-4 text-sm text-gray-600">
                    <span>Views: {listing.views || 0}</span>
                    <span>Listed: {new Date(listing.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  listing.status === 'active' 
                    ? 'bg-green-100 text-green-800' 
                    : listing.status === 'sold'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {listing.status}
                </span>
                <a 
                  href={`/edit-item/${listing._id}`}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  Edit
                </a>
                <button 
                  onClick={() => deleteListing(listing._id)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <span className="text-6xl block mb-4">📦</span>
          <p className="text-gray-600 mb-4">You haven't listed any items yet</p>
          <a 
            href="/sell"
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            List Your First Item
          </a>
        </div>
      )}
    </div>
  );
}

function SavedTab({ savedItems, onRefresh }: { savedItems: SavedItem[], onRefresh: () => void }) {
  const removeSavedItem = async (itemId: string) => {
    try {
      await fetch(`/api/saved-items/${itemId}`, { method: 'DELETE' });
      onRefresh(); // Refresh data
    } catch (error) {
      console.error('Error removing saved item:', error);
    }
  };

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Saved Items</h3>
      {savedItems.length > 0 ? (
        <div className="space-y-4">
          {savedItems.map((item) => (
            <div key={item._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                  {item.images && item.images.length > 0 ? (
                    <img 
                      src={item.images[0]} 
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl">📦</span>
                  )}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{item.title}</h4>
                  <p className="text-green-600 font-bold">NPR {item.price.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">
                    Saved on {new Date(item.savedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <a 
                  href={`/item/${item._id}`}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  View
                </a>
                <button 
                  onClick={() => removeSavedItem(item._id)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <span className="text-6xl block mb-4">❤️</span>
          <p className="text-gray-600 mb-4">No saved items yet</p>
          <a 
            href="/browse"
            className="bg-amber-600 text-white px-6 py-2 rounded-lg hover:bg-amber-700 transition-colors"
          >
            Browse Items
          </a>
        </div>
      )}
    </div>
  );
}

function ActivityTab({ activities }: { activities: Activity[] }) {
  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Activity</h3>
      {activities.length > 0 ? (
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  activity.type === 'sale' ? 'bg-green-100' : 
                  activity.type === 'view' ? 'bg-blue-100' : 'bg-amber-100'
                }`}>
                  <span className="text-lg">
                    {activity.type === 'sale' ? '💰' : activity.type === 'view' ? '👀' : '💬'}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{activity.message}</p>
                  <p className="text-sm text-gray-600">
                    {new Date(activity.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              {activity.amount && (
                <span className="text-green-600 font-bold">+NPR {activity.amount}</span>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <span className="text-6xl block mb-4">📈</span>
          <p className="text-gray-600">No activity yet</p>
        </div>
      )}
    </div>
  );
}