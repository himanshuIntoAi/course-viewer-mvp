'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '../../../services/authentication/login/auth';

const OnboardingContext = createContext();

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
}

export function OnboardingProvider({ children }) {
  const router = useRouter();
  const [onboardingData, setOnboardingData] = useState({
    step: 1,
    category: 'IT',
    personalInfo: {},
    preferences: {},
    profileId: null,
    userType: 'student' // Default to student
  });

  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const updateOnboardingData = (newData) => {
    setOnboardingData(prev => {
      const updated = {
        ...prev,
        ...newData
      };
      
      // Store user type in sessionStorage when it changes
      if (newData.userType) {
        // Store the user type selection
        sessionStorage.setItem('user_type', newData.userType);
        
        // Store boolean values for student/instructor flags
        if (newData.userType === 'student') {
          sessionStorage.setItem('is_student', true);
          sessionStorage.setItem('is_instructor', false);
        } else if (newData.userType === 'instructor') {
          sessionStorage.setItem('is_student', false);
          sessionStorage.setItem('is_instructor', true);
        }
      }
      
      return updated;
    });
  };

  const clearAuthState = () => {
    setUser(null);
    setIsAuthenticated(false);
    setToken(null);
    localStorage.removeItem('access_token');
    localStorage.removeItem('token_expires_at');
  };

  // Function to get the JWT token
  const getToken = () => {
    if (typeof window !== 'undefined') {
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

  // Function to set the JWT token - needed for GitHub auth
  const setToken = (token) => {
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('access_token', token);
      } else {
        localStorage.removeItem('access_token');
        localStorage.removeItem('token_expires_at');
      }
    }
  };

  // Enhanced authenticatedFetch with retry mechanism
  const authenticatedFetch = async (url, options = {}) => {
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
  };

  // Enhanced fetchUserData with validation
  const fetchUserData = async () => {
    try {
      const response = await authenticatedFetch('http://localhost:8000/api/v1/auth/user');
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
  };

  useEffect(() => {
    const checkAuthentication = async () => {
      // setIsAuthenticated(true);
      // Don't set loading true on initial check
      if (isInitialized) {
        setLoading(true);
      }
      
      // try {
      //   // Skip auth check if on home page or signing out
      //   const isHomePage = typeof window !== 'undefined' && window.location.pathname === '/';
      //   const isSigningOut = typeof window !== 'undefined' && window.location.search.includes('signout=true');
        
      //   if (isHomePage || isSigningOut) {
      //     if (isSigningOut) {
      //       clearAuthState();
      //     }
      //     return;
      //   }

      //   // Skip auth check on callback page
      //   if (typeof window !== 'undefined' && window.location.pathname.includes('/api/auth/callback')) {
      //     return;
      //   }

      //   const token = getToken();
      //   if (!token) {
      //     clearAuthState();
      //     // Only redirect if not on excluded pages and not home page
      //     const isExcludedPage = window.location.pathname.startsWith('/auth') ||
      //                           window.location.pathname.includes('/api/auth/callback');
          
      //     if (!isExcludedPage && !isHomePage && !isSigningOut) {
      //       window.location.replace('/?error=' + encodeURIComponent('Authentication required'));
      //     }
      //     return;
      //   }

      //   // Verify token with backend
      //   const response = await fetch('http://localhost:8000/api/v1/auth/verify', {
      //     headers: {
      //       'Authorization': `Bearer ${token}`
      //     }
      //   });

      //   if (!response.ok) {
      //     throw new Error('Token verification failed');
      //   }

      //   setIsAuthenticated(true);
        
      //   // Fetch user data only if we don't have it
      //   if (!user) {
      //     await fetchUserData();
      //   }
      // } catch (error) {
      //   console.error('Authentication check failed:', error);
      //   clearAuthState();
      // } finally {
      //   setLoading(false);
      //   if (!isInitialized) {
      //     setIsInitialized(true);
      //   }
      // }

      setIsAuthenticated(true);
    };

    checkAuthentication();
    // Reduce the frequency of authentication checks to reduce unnecessary requests
    const interval = setInterval(checkAuthentication, 300000); // Check every 5 minutes

    return () => clearInterval(interval);
  }, []);

  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      clearAuthState(); // Clear existing state first
      
      const data = await auth.login(email, password);
      
      if (data.access_token) {
        setToken(data.access_token);
        if (data.expires_in) {
          const expiresAt = Date.now() + (data.expires_in * 1000);
          localStorage.setItem('token_expires_at', expiresAt.toString());
        }
        
        // Set authentication and user data atomically
        const userData = {
          id: data.user_id,
          email: data.email,
          display_name: data.display_name,
          profile_image: data.profile_image
        };
        
        setIsAuthenticated(true);
        setUser(userData);
        
        window.location.replace('/dashboard');
      }
    } catch (error) {
      setError(error.message);
      clearAuthState();
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email, password, displayName) => {
    try {
      setLoading(true);
      setError(null);
      const data = await auth.register(email, password, displayName);
      return data;
    } catch (error) {
      setError(error.message);
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

      window.location.replace('/?signout=true');
    } catch (error) {
      console.error('Logout error:', error);
      setError(error.message);
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