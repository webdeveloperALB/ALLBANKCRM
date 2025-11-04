'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { getBankClient } from '@/lib/supabase-multi';

interface UserRole {
  id: string;
  email: string;
  is_admin: boolean;
  is_manager: boolean;
  is_superiormanager: boolean;
  full_name: string | null;
  bank_key?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: UserRole | null;
  login: (email: string, password: string) => Promise<{success: boolean; error?: string}>;
  logout: () => void;
  canAccessAdminPanel: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_KEY = 'crm_admin_auth';
const USER_KEY = 'crm_admin_user';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const authStatus = localStorage.getItem(AUTH_KEY);
    const savedUser = localStorage.getItem(USER_KEY);

    if (authStatus === 'true' && savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        setIsAuthenticated(true);
      } catch (e) {
        localStorage.removeItem(AUTH_KEY);
        localStorage.removeItem(USER_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  const canAccessAdminPanel = (): boolean => {
    if (!user) return false;

    // MUST have is_admin = true to access admin panel
    // This is the ONLY requirement - being manager or superior manager alone is NOT enough
    return user.is_admin === true;
  };

  const login = async (email: string, password: string): Promise<{success: boolean; error?: string}> => {
    try {
      // Check all banks for the user
      const bankKeys = ['digitalchain', 'cayman', 'lithuanian'];

      for (const bankKey of bankKeys) {
        const supabase = getBankClient(bankKey);

        const { data: users, error } = await supabase
          .from('users')
          .select('id, email, is_admin, is_manager, is_superiormanager, full_name, password')
          .eq('email', email)
          .maybeSingle();

        if (error) {
          console.error(`Error checking ${bankKey}:`, error);
          continue; // Try next bank
        }

        if (!users) {
          continue; // User not found in this bank, try next
        }

        // Simple password check
        if (users.password !== password) {
          return { success: false, error: 'Invalid email or password' };
        }

        // Check if user can access admin panel
        // CRITICAL: Must have is_admin = true
        if (!users.is_admin) {
          return {
            success: false,
            error: 'Access denied. Admin privileges required to access this panel.'
          };
        }

        // User found and authenticated successfully
        const userData: UserRole = {
          id: users.id,
          email: users.email,
          is_admin: users.is_admin,
          is_manager: users.is_manager || false,
          is_superiormanager: users.is_superiormanager || false,
          full_name: users.full_name,
          bank_key: bankKey
        };

        setUser(userData);
        setIsAuthenticated(true);
        localStorage.setItem(AUTH_KEY, 'true');
        localStorage.setItem(USER_KEY, JSON.stringify(userData));

        return { success: true };
      }

      // User not found in any bank
      return { success: false, error: 'Invalid email or password' };
    } catch (error: any) {
      console.error('Login error:', error);
      return { success: false, error: 'Login failed. Please try again.' };
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem(AUTH_KEY);
    localStorage.removeItem(USER_KEY);
  };

  if (isLoading) {
    return null;
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, canAccessAdminPanel }}>
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
