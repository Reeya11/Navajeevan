// contexts/AuthContext.tsx
'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>; // Changed from void to Promise<void>
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in on app load
    checkAuthStatus();
  }, []);

// contexts/AuthContext.tsx - UPDATE the checkAuthStatus function
const checkAuthStatus = async () => {
  try {
    const res = await fetch('/api/auth/me', {
      credentials: 'include' // IMPORTANT: Include cookies!
    });
    
    if (res.ok) {
      const userData = await res.json();
      setUser(userData);
    } else {
      setUser(null);
    }
  } catch (error) {
    console.error('Auth check failed:', error);
    setUser(null);
  } finally {
    setIsLoading(false);
  }
};

  const login = async (email: string, password: string) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (res.ok) {
      const userData = await res.json();
      setUser(userData.user);
      router.push('/dashboard');
    } else {
      throw new Error('Login failed');
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      
      // Clear any auth cookies
      document.cookie = 'auth-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      
      router.push('/');
      router.refresh(); // Refresh the page to update UI
    } catch (error) {
      console.error('Logout failed:', error);
      throw error; // Re-throw to handle in navbar
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}