'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  avatar?: string; // URL or base64 string
  school?: string; // School / Institution name
}

interface LoginResponse {
  success: boolean;
  token: string;
  user: {
    id: number;
    name: string;
    surname: string;
    email: string;
    role: string;
  };
}

interface UserContextType {
  user: UserProfile | null;
  token: string | null;
  updateUser: (updates: Partial<UserProfile>) => void;
  updateAvatar: (avatar: string) => void;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load user and token from localStorage
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('userProfile');
      const savedToken = localStorage.getItem('authToken');
      
      if (savedUser && savedToken) {
        try {
          setUser(JSON.parse(savedUser));
          setToken(savedToken);
        } catch (e) {
          console.error('Error loading user data:', e);
          // Clear invalid data
          localStorage.removeItem('userProfile');
          localStorage.removeItem('authToken');
        }
      }
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      // Check if response is ok (status 200-299)
      if (!response.ok) {
        // Try to parse error response
        try {
          const errorData = await response.json();
          return { 
            success: false, 
            error: errorData.message || 'Authentication failed. Please check your credentials and try again.' 
          };
        } catch {
          return { 
            success: false, 
            error: 'Authentication failed. Please check your credentials and try again.' 
          };
        }
      }

      const data: LoginResponse = await response.json();

      // Strictly check that success is true AND token and user exist
      if (data.success === true && data.token && data.user) {
        // Convert API user format to UserProfile format
        const userProfile: UserProfile = {
          id: data.user.id.toString(),
          firstName: data.user.name,
          lastName: data.user.surname,
          email: data.user.email,
          role: data.user.role,
        };

        // Save to state and localStorage
        setUser(userProfile);
        setToken(data.token);
        
        if (typeof window !== 'undefined') {
          localStorage.setItem('userProfile', JSON.stringify(userProfile));
          localStorage.setItem('authToken', data.token);
        }

        return { success: true };
      } else {
        // If success is false or missing token/user, authentication failed
        return { 
          success: false, 
          error: 'This account is not authenticated. Please authenticate your account and then try again.' 
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: 'Network error. Please check your connection and try again.' 
      };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    
    if (typeof window !== 'undefined') {
      // Save user preferences before clearing (theme and language)
      const savedTheme = localStorage.getItem('theme');
      const savedLanguage = localStorage.getItem('language');
      
      // Clear all localStorage data
      localStorage.clear();
      
      // Restore user preferences (these are not account-specific)
      if (savedTheme) {
        localStorage.setItem('theme', savedTheme);
      }
      if (savedLanguage) {
        localStorage.setItem('language', savedLanguage);
      }
      
      // Clear sessionStorage to ensure no session data persists
      sessionStorage.clear();
    }
  };

  const updateUser = (updates: Partial<UserProfile>) => {
    setUser((prevUser) => {
      if (!prevUser) return prevUser;
      const updatedUser = { ...prevUser, ...updates };
      
      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('userProfile', JSON.stringify(updatedUser));
      }
      
      return updatedUser;
    });
  };

  const updateAvatar = (avatar: string) => {
    updateUser({ avatar });
  };

  const isAuthenticated = !!token && !!user;

  return (
    <UserContext.Provider value={{ 
      user, 
      token,
      updateUser, 
      updateAvatar, 
      login,
      logout,
      isLoading,
      isAuthenticated
    }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}

