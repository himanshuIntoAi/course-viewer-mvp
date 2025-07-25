'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '../../../services/login/auth';

// Define User interface locally to avoid import issues
interface User {
  id: string;
  display_name: string;
  email: string;
  profile_image: string;
  is_student: boolean;
  is_instructor: boolean;
  full_name?: string;
  username?: string;
  user_type: string;
}

// Define AuthResponse interface locally
interface AuthResponse {
  access_token: string;
  expires_in?: number;
  user_id: string;
  email: string;
  display_name: string;
  profile_image: string;
  is_student: boolean;
  is_instructor: boolean;
  redirect_path?: string;
}

interface OnboardingData {
  step: number;
  category: string;
  personalInfo: Record<string, string | number | boolean>;
  preferences: Record<string, string | number | boolean>;
  profileId: string | null;
  userType: 'student' | 'instructor';
}

interface OnboardingContextType {
  onboardingData: OnboardingData;
  updateOnboardingData: (newData: Partial<OnboardingData>) => void;
  loading: boolean;
  isAuthenticated: boolean;
  setIsAuthenticated: (value: boolean) => void;
  user: User | null;
  setUser: (user: User | null) => void;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  getToken: () => string | null;
  setToken: (token: string | null) => void;
  fetchUserData: () => Promise<User>;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
}

// Check if code is running in browser
const isBrowser = typeof window !== 'undefined';

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    step: 1,
    category: 'IT',
    personalInfo: {},
    preferences: {},
    profileId: null,
    userType: 'student' // Default to student
  });

  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const updateOnboardingData = (newData: Partial<OnboardingData>) => {
    setOnboardingData(prev => {
      const updated = {
        ...prev,
        ...newData
      };
      
      // Store user type in sessionStorage when it changes
      if (newData.userType && isBrowser) {
        // Store the user type selection
        sessionStorage.setItem('user_type', newData.userType);
        
        // Store boolean values for student/instructor flags
        if (newData.userType === 'student') {
          sessionStorage.setItem('is_student', 'true');
          sessionStorage.setItem('is_instructor', 'false');
        } else if (newData.userType === 'instructor') {
          sessionStorage.setItem('is_student', 'false');
          sessionStorage.setItem('is_instructor', 'true');
        }
      }
      
      return updated;
    });
  };

  const clearAuthState = useCallback(() => {
    setUser(null);
    setIsAuthenticated(false);
    setToken(null);
    if (isBrowser) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('token_expires_at');
    }
  }, []);

  // Function to get the JWT token
  const getToken = () => {
    if (isBrowser) {
      const token = localStorage.getItem('access_token');
      const expiresAt = localStorage.getItem('token_expires_at');
      
      // Check if token is expired
      if (token && expiresAt) {
        if (Date.now() >= parseInt(expiresAt)) {
          // Token is expired, clear it
          localStorage.removeItem('access_token');
          localStorage.removeItem('token_expires_at');
          return null;
        }
      }
      return token;
    }
    return null;
  };

  // Function to set the JWT token
  const setToken = (token: string | null) => {
    if (isBrowser) {
      if (token) {
        localStorage.setItem('access_token', token);
      } else {
        localStorage.removeItem('access_token');
        localStorage.removeItem('token_expires_at');
      }
    }
  };

  // Enhanced authenticatedFetch with retry mechanism
  const authenticatedFetch = useCallback(async (url: string, options: RequestInit = {}) => {
    const token = getToken();
    if (!token) {
      clearAuthState();
      throw new Error('No authentication token found');
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          ...options.headers,
        }
      });

      if (response.status === 401) {
        clearAuthState();
        router.push('/?error=' + encodeURIComponent('Session expired. Please login again.'));
        throw new Error('Authentication token expired');
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'An error occurred' }));
        throw new Error(errorData.detail || 'Request failed');
      }

      return response;
    } catch (error) {
      if (!navigator.onLine) {
        throw new Error('No internet connection. Please check your network.');
      }
      throw error;
    }
  }, [clearAuthState, router]);

  // Enhanced fetchUserData with validation
  const fetchUserData = useCallback(async () => {
    try {
      const response = await authenticatedFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/user`);
      const userData = await response.json();
      
      // Validate user data
      if (!userData.id || !userData.email) {
        throw new Error('Invalid user data received');
      }

      setUser(userData);
      return userData;
    } catch (error) {
      console.error('Error fetching user data:', error);
      clearAuthState();
      throw error;
    }
  }, [authenticatedFetch, clearAuthState]);

  useEffect(() => {
    const checkAuthentication = async () => {
      // Don't set loading true on initial check
      if (isInitialized) {
        setLoading(true);
      }
      
      try {
        // Skip auth check if on home page or signing out
        const isHomePage = typeof window !== 'undefined' && window.location.pathname === '/';
        const isSigningOut = typeof window !== 'undefined' && window.location.search.includes('signout=true');
        
        if (isHomePage || isSigningOut) {
          if (isSigningOut) {
            clearAuthState();
          }
          return;
        }

        // Skip auth check on callback page or if this is an OAuth redirect
        if (typeof window !== 'undefined') {
          const pathname = window.location.pathname;
          const search = window.location.search;
          
          if (pathname.includes('/api/auth/callback') || 
              search.includes('oauth_redirect=true') ||
              search.includes('token=')) {
            // If there's a token in URL, set it in localStorage immediately
            const urlParams = new URLSearchParams(search);
            const token = urlParams.get('token');
            const userData = urlParams.get('user');
            
            if (token) {
              localStorage.setItem('access_token', token);
              document.cookie = `auth_token=${token}; path=/; max-age=${24 * 60 * 60}; SameSite=Lax;`;
              setIsAuthenticated(true);
              
              // If we have user data, parse it and set the user state
              if (userData) {
                try {
                  const parsedUser = JSON.parse(userData);
                  setUser({
                    id: parsedUser.user_id,
                    display_name: parsedUser.display_name,
                    email: parsedUser.email,
                    profile_image: parsedUser.profile_image,
                    is_student: parsedUser.is_student,
                    is_instructor: parsedUser.is_instructor,
                    user_type: parsedUser.is_student ? 'student' : 'instructor'
                  });
                  
                  // Store user data persistently
                  localStorage.setItem('user', userData);
                } catch (e) {
                  console.error('Failed to parse user data from URL', e);
                }
              }

              // Clear URL parameters to avoid issues with subsequent refreshes
              if (window.history && window.history.replaceState) {
                const cleanUrl = pathname;
                window.history.replaceState({}, document.title, cleanUrl);
              }
              
              return;
            }
          }
        }
        
        // Rest of the authentication check...
        const token = getToken();
        if (!token) {
          clearAuthState();
          // Only redirect if on dashboard pages
          const isDashboardPage = typeof window !== 'undefined' && (
            window.location.pathname.startsWith('/student-dashboard') ||
            window.location.pathname.startsWith('/mentor-dashboard')
          );
          
          if (isDashboardPage && !isSigningOut) {
            router.push('/login?redirect=' + encodeURIComponent(window.location.pathname));
          }
          return;
        }

        // Verify token with backend
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/verify`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Token verification failed');
        }

        setIsAuthenticated(true);
        
        // Fetch user data only if we don't have it
        if (!user) {
          await fetchUserData();
        }
      } catch (error) {
        console.error('Authentication check failed:', error);
        clearAuthState();
      } finally {
        setLoading(false);
        if (!isInitialized) {
          setIsInitialized(true);
        }
      }
    };

    checkAuthentication();
    // Reduce the frequency of authentication checks to reduce unnecessary requests
    const interval = setInterval(checkAuthentication, 300000); // Check every 5 minutes

    return () => clearInterval(interval);
  }, [clearAuthState, fetchUserData, isInitialized, user, router]);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      clearAuthState(); // Clear existing state first
      
      const data: AuthResponse = await auth.login(email, password);
      
      if (data.access_token) {
        setToken(data.access_token);
        if (data.expires_in) {
          const expiresAt = Date.now() + (data.expires_in * 1000);
          localStorage.setItem('token_expires_at', expiresAt.toString());
        }
        
        // Set auth cookie with proper expiration and security
        const maxAge = data.expires_in || 86400; // Default to 24 hours
        const secure = typeof window !== 'undefined' && window.location.protocol === 'https:' ? 'Secure;' : '';
        const domain = process.env.COOKIE_DOMAIN || (typeof window !== 'undefined' ? window.location.hostname : '');
        
        // Set HTTP-only cookie with proper attributes
        if (typeof document !== 'undefined') {
          document.cookie = `auth_token=${data.access_token}; path=/; max-age=${maxAge}; SameSite=Lax; ${secure} domain=${domain}`;
        }
        
        // Set authentication and user data atomically
        const userData: User = {
          id: data.user_id, // Now correctly handling as string from API
          email: data.email,
          display_name: data.display_name,
          profile_image: data.profile_image,
          is_student: data.is_student,
          is_instructor: data.is_instructor,
          user_type: data.is_student ? 'student' : 'instructor'
        };
        
        setIsAuthenticated(true);
        setUser(userData);
        
        // Store user type based on API response
        if (data.is_student) {
          sessionStorage.setItem('user_type', 'student');
          document.cookie = `temp_is_student=true; path=/; domain=${process.env.COOKIE_DOMAIN || (typeof window !== 'undefined' ? window.location.hostname : '')}`;
          document.cookie = `temp_is_instructor=false; path=/; domain=${process.env.COOKIE_DOMAIN || (typeof window !== 'undefined' ? window.location.hostname : '')}`;
        } else if (data.is_instructor) {
          sessionStorage.setItem('user_type', 'instructor');
          document.cookie = `temp_is_student=false; path=/; domain=${process.env.COOKIE_DOMAIN || (typeof window !== 'undefined' ? window.location.hostname : '')}`;
          document.cookie = `temp_is_instructor=true; path=/; domain=${process.env.COOKIE_DOMAIN || (typeof window !== 'undefined' ? window.location.hostname : '')}`;
        }

        // Use the redirect_path from the API response if available, otherwise default to dashboard
        const redirectPath = data.redirect_path || (data.is_student ? '/student-dashboard' : '/mentor-dashboard');
        router.push(redirectPath);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
      clearAuthState();
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, displayName: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await auth.register(email, password, displayName);
      return data;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      clearAuthState(); // Clear state immediately
      
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          await auth.logout();
        } catch (error) {
          console.error('Logout API error:', error);
        }
      }

      router.push('/?signout=true');
    } catch (error) {
      console.error('Logout error:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const value = {
    onboardingData,
    updateOnboardingData,
    loading,
    isAuthenticated,
    setIsAuthenticated,
    user,
    setUser,
    error,
    login,
    register,
    logout,
    getToken,
    setToken,
    fetchUserData
  };

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
} 