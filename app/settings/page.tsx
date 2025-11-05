// app/settings/page.tsx - Earthy NavaJeevan Theme
'use client';
import { useState } from 'react';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('password');

  return (
    <div className="min-h-screen bg-amber-50">
      {/* Earthy Header */}
      <div className="bg-amber-900 text-amber-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-8">
            <h1 className="text-3xl font-bold">Account Settings</h1>
            <p className="text-amber-200 mt-2">Manage your NavaJeevan preferences</p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Earthy Sidebar */}
          <div className="w-80 flex-shrink-0">
            <div className="bg-amber-100 rounded-2xl border border-amber-200 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-amber-600 text-amber-50 p-2 rounded-lg">
                  <span className="text-lg">⚙️</span>
                </div>
                <h3 className="text-xl font-semibold text-amber-900">Settings</h3>
              </div>
              
              <nav className="space-y-2">
                {[
                  { id: 'password', name: 'Change Password', icon: '🔐' },
                  { id: 'notifications', name: 'Notifications', icon: '🔔' },
                  { id: 'privacy', name: 'Privacy', icon: '👁️' },
                  { id: 'danger', name: 'Danger Zone', icon: '⚠️' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full text-left p-4 rounded-xl transition-all duration-200 flex items-center gap-4 group ${
                      activeTab === tab.id
                        ? 'bg-amber-500 text-amber-900 shadow-md border border-amber-400'
                        : 'bg-amber-50 text-amber-800 hover:bg-amber-200 hover:shadow-sm border border-amber-100'
                    }`}
                  >
                    <span className="text-xl group-hover:scale-110 transition-transform">{tab.icon}</span>
                    <span className="font-medium">{tab.name}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-amber-100 rounded-2xl border border-amber-200 shadow-sm">
              {activeTab === 'password' && <ChangePasswordSection />}
              {activeTab === 'notifications' && <NotificationSettings />}
              {activeTab === 'privacy' && <PrivacySettings />}
              {activeTab === 'danger' && <DangerZone />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Change Password Section - Earthy Theme
function ChangePasswordSection() {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (formData.newPassword !== formData.confirmPassword) {
      alert("New passwords don't match!");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        alert('Password changed successfully!');
        setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        alert('Failed to change password. Please check your current password.');
      }
    } catch (error) {
      alert('Error changing password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center gap-4 mb-8">
        <div className="bg-amber-500 text-amber-900 p-3 rounded-xl">
          <span className="text-2xl">🔐</span>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-amber-900">Change Password</h2>
          <p className="text-amber-700 mt-1">Secure your NavaJeevan account</p>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6 max-w-md">
        <div>
          <label className="block text-sm font-medium text-amber-800 mb-3">
            Current Password
          </label>
          <input
            type="password"
            value={formData.currentPassword}
            onChange={(e) => setFormData({...formData, currentPassword: e.target.value})}
            className="w-full px-4 py-3 border border-amber-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-amber-50 text-amber-900 placeholder-amber-600"
            placeholder="Enter current password"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-amber-800 mb-3">
            New Password
          </label>
          <input
            type="password"
            value={formData.newPassword}
            onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
            className="w-full px-4 py-3 border border-amber-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-amber-50 text-amber-900 placeholder-amber-600"
            placeholder="Enter new password"
            minLength={6}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-amber-800 mb-3">
            Confirm New Password
          </label>
          <input
            type="password"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
            className="w-full px-4 py-3 border border-amber-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-amber-50 text-amber-900 placeholder-amber-600"
            placeholder="Confirm new password"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-amber-600 text-amber-50 px-6 py-3 rounded-xl hover:bg-amber-700 transition-colors disabled:opacity-50 font-semibold shadow-md hover:shadow-lg"
        >
          {loading ? 'Updating Password...' : 'Update Password'}
        </button>
      </form>
    </div>
  );
}

// Notification Settings - Earthy Theme
function NotificationSettings() {
  const [notifications, setNotifications] = useState({
    emailMessages: true,
    emailPriceDrops: true,
    pushMessages: false,
    pushNewListings: true
  });

  const updateNotification = (key: string, value: boolean) => {
    setNotifications(prev => ({...prev, [key]: value}));
    fetch('/api/user/notifications', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [key]: value })
    });
  };

  return (
    <div className="p-8">
      <div className="flex items-center gap-4 mb-8">
        <div className="bg-amber-500 text-amber-900 p-3 rounded-xl">
          <span className="text-2xl">🔔</span>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-amber-900">Notification Preferences</h2>
          <p className="text-amber-700 mt-1">Choose how you want to stay updated</p>
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between p-6 bg-amber-50 rounded-xl border border-amber-200 hover:bg-amber-100 transition-colors">
          <div className="flex items-center gap-4">
            <div className="bg-amber-200 p-2 rounded-lg">
              <span className="text-amber-700">💬</span>
            </div>
            <div>
              <p className="font-semibold text-amber-900">New Messages</p>
              <p className="text-amber-700 text-sm">Get notified when you receive new messages</p>
            </div>
          </div>
          <input
            type="checkbox"
            checked={notifications.emailMessages}
            onChange={(e) => updateNotification('emailMessages', e.target.checked)}
            className="h-5 w-5 text-amber-600 focus:ring-amber-500 border-amber-300 rounded"
          />
        </div>

        <div className="flex items-center justify-between p-6 bg-amber-50 rounded-xl border border-amber-200 hover:bg-amber-100 transition-colors">
          <div className="flex items-center gap-4">
            <div className="bg-amber-200 p-2 rounded-lg">
              <span className="text-amber-700">💰</span>
            </div>
            <div>
              <p className="font-semibold text-amber-900">Price Drops</p>
              <p className="text-amber-700 text-sm">Get notified when prices drop on saved items</p>
            </div>
          </div>
          <input
            type="checkbox"
            checked={notifications.emailPriceDrops}
            onChange={(e) => updateNotification('emailPriceDrops', e.target.checked)}
            className="h-5 w-5 text-amber-600 focus:ring-amber-500 border-amber-300 rounded"
          />
        </div>
      </div>
    </div>
  );
}

// Privacy Settings - Earthy Theme
function PrivacySettings() {
  const [privacy, setPrivacy] = useState({
    showPhone: true,
    profilePublic: true
  });

  const updatePrivacy = (key: string, value: boolean) => {
    setPrivacy(prev => ({...prev, [key]: value}));
    fetch('/api/user/privacy', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [key]: value })
    });
  };

  return (
    <div className="p-8">
      <div className="flex items-center gap-4 mb-8">
        <div className="bg-amber-500 text-amber-900 p-3 rounded-xl">
          <span className="text-2xl">👀</span>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-amber-900">Privacy Settings</h2>
          <p className="text-amber-700 mt-1">Control your visibility in the marketplace</p>
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between p-6 bg-amber-50 rounded-xl border border-amber-200 hover:bg-amber-100 transition-colors">
          <div className="flex items-center gap-4">
            <div className="bg-amber-200 p-2 rounded-lg">
              <span className="text-amber-700">📞</span>
            </div>
            <div>
              <p className="font-semibold text-amber-900">Show Phone Number</p>
              <p className="text-amber-700 text-sm">Buyers can see your phone number on listings</p>
            </div>
          </div>
          <input
            type="checkbox"
            checked={privacy.showPhone}
            onChange={(e) => updatePrivacy('showPhone', e.target.checked)}
            className="h-5 w-5 text-amber-600 focus:ring-amber-500 border-amber-300 rounded"
          />
        </div>

        <div className="flex items-center justify-between p-6 bg-amber-50 rounded-xl border border-amber-200 hover:bg-amber-100 transition-colors">
          <div className="flex items-center gap-4">
            <div className="bg-amber-200 p-2 rounded-lg">
              <span className="text-amber-700">🌍</span>
            </div>
            <div>
              <p className="font-semibold text-amber-900">Public Profile</p>
              <p className="text-amber-700 text-sm">Others can see your listings and profile</p>
            </div>
          </div>
          <input
            type="checkbox"
            checked={privacy.profilePublic}
            onChange={(e) => updatePrivacy('profilePublic', e.target.checked)}
            className="h-5 w-5 text-amber-600 focus:ring-amber-500 border-amber-300 rounded"
          />
        </div>
      </div>
    </div>
  );
}

// Danger Zone - Earthy Theme
function DangerZone() {
  const [confirmDelete, setConfirmDelete] = useState('');

  const deleteAccount = async () => {
    if (confirmDelete !== 'DELETE') {
      alert("Please type 'DELETE' to confirm");
      return;
    }

    if (!confirm('Are you sure? This will permanently delete your account and all your listings!')) return;

    try {
      const response = await fetch('/api/user/account', {
        method: 'DELETE'
      });

      if (response.ok) {
        alert('Account deleted successfully');
        window.location.href = '/';
      }
    } catch (error) {
      alert('Error deleting account');
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center gap-4 mb-8">
        <div className="bg-red-500 text-red-50 p-3 rounded-xl">
          <span className="text-2xl">⚠️</span>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-amber-900">Danger Zone</h2>
          <p className="text-amber-700 mt-1">Irreversible account actions</p>
        </div>
      </div>
      
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
        <div className="flex items-start gap-4 mb-6">
          <div className="bg-red-100 p-3 rounded-lg">
            <span className="text-red-600 text-xl">🔥</span>
          </div>
          <div>
            <h3 className="font-bold text-red-900 text-lg">Delete Account</h3>
            <p className="text-red-700 mt-2">
              This will permanently delete your NavaJeevan account, remove all your listings, 
              messages, and saved items. This action cannot be undone.
            </p>
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-red-700 mb-2">
              Type "DELETE" to confirm
            </label>
            <input
              type="text"
              placeholder="Type DELETE here"
              value={confirmDelete}
              onChange={(e) => setConfirmDelete(e.target.value)}
              className="w-full max-w-xs px-4 py-3 border border-red-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white text-red-900"
            />
          </div>
          <button
            onClick={deleteAccount}
            disabled={confirmDelete !== 'DELETE'}
            className="bg-red-600 text-red-50 px-6 py-3 rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
          >
            Permanently Delete Account
          </button>
        </div>
      </div>
    </div>
  );
}