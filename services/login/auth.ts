import { nanoid } from 'nanoid';
import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const FRONTEND_URL = process.env.NEXT_PUBLIC_APP_URL;
const API_BASE = `${API_URL}/api/v1`;
const DEFAULT_AVATAR = '/images/avatar-placeholder.svg';

// User type constants
const USER_TYPES = {
  LEARNER: 'learner',
  EARNER: 'earner'
} as const;

// Add this helper at the top of the file
const isBrowser = typeof window !== 'undefined';

// Helper function to get current user type
const getCurrentUserType = (): string => {
  if (isBrowser) {
    // First check sessionStorage as it's more likely to have the current selection
    const sessionType = sessionStorage.getItem('user_type');
    if (sessionType && (sessionType === USER_TYPES.LEARNER || sessionType === USER_TYPES.EARNER)) {
      console.log('Found valid userType in sessionStorage:', sessionType);
      return sessionType;
    }
    
    // Then check localStorage (may be from previous sessions)
    const localType = localStorage.getItem('user_type');
    if (localType && (localType === USER_TYPES.LEARNER || localType === USER_TYPES.EARNER)) {
      console.log('Found valid userType in localStorage:', localType);
      return localType;
    }
    
    // If none found or invalid, default to LEARNER
    console.log('No valid userType found, defaulting to LEARNER');
    return USER_TYPES.LEARNER;
  }
  return USER_TYPES.LEARNER;
};

// Add at the top with other constants
let userDataCache: User | null = null;
let userDataPromise: Promise<User | null> | null = null;
const USER_CACHE_DURATION = 60000; // 1 minute
let lastUserFetch = 0;

// Use a type union for router to handle both AppRouter and undefined
type RouterType = AppRouterInstance | undefined;

interface User {
  id: string;
  display_name: string;
  email: string;
  profile_image: string;  // Can be a URL, base64 string, or path to default avatar
  is_student: boolean;
  is_instructor: boolean;
  full_name?: string;
  username?: string;
  user_type: string;
}

interface AuthResponse {
  access_token: string;
  expires_in?: number;
  user_id: string;
  email: string;
  display_name: string;
  profile_image: string;
  is_student: boolean;
  is_instructor: boolean;
}

interface OAuthState {
  stateId: string;
  redirectPath: string;
  timestamp: number;
}

interface RequestOptions extends RequestInit {
  headers?: Record<string, string>;
  signal?: AbortSignal;
}

interface ApiResponse extends AuthResponse {
  detail?: string;
  message?: string;
  [key: string]: unknown;
}

const handleResponse = async (response: Response): Promise<ApiResponse> => {
  const contentType = response.headers.get('content-type');
  if (!response.ok) {
    let errorMessage: string;
    try {
      if (contentType?.includes('application/json')) {
        const error = await response.json();
        errorMessage = error.detail || error.message;
      } else {
        errorMessage = await response.text();
      }
    } catch {
      errorMessage = response.statusText;
    }
    throw new Error(errorMessage || 'Request failed');
  }
  
  if (contentType?.includes('application/json')) {
    return response.json();
  }
  
  // If we get here with a text response, we need to throw an error
  // as we can't convert text to expected JSON structure
  throw new Error('Invalid response format: expected JSON');
};

const defaultHeaders: Record<string, string> = {
  'Content-Type': 'application/json',
  'Accept': 'application/json'
};

// Health check function
const checkBackendHealth = async (/* signal?: AbortSignal */): Promise<boolean> => {
  try {
    const response = await fetch(`${API_URL}/health`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
      // signal
    });
    return response.ok;
  } catch (error) {
    console.error('Backend health check failed:', error);
    return false;
  }
};

const makeRequest = async (url: string, options: RequestOptions = {}): Promise<Response> => {
  try {
    // Check backend health first
    if (!url.includes('github.com')) {
      const isHealthy = await checkBackendHealth();
      if (!isHealthy) {
        throw new Error('Backend server is not available. Please ensure it is running.');
      }
    }

    // Ensure URL is absolute
    const fullUrl = url.startsWith('http') ? url : `${API_URL}${url}`;
    
    const requestOptions: RequestOptions = {
      ...options,
      credentials: 'include',
      headers: {
        ...defaultHeaders,
        ...options.headers
      }
    };

    console.log(`Making ${options.method || 'GET'} request to:`, fullUrl);
    const response = await fetch(fullUrl, requestOptions);
    
    // Log response details for debugging
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (response.status === 401) {
      throw new Error('Not authenticated');
    }
    
    return response;
  } catch (error) {
    console.error('Request error:', error);
    if (!navigator.onLine) {
      throw new Error('No internet connection - Please check your network');
    }
    if (error instanceof Error && error.message === 'Failed to fetch') {
      if (url.includes('github.com')) {
        throw new Error('Unable to connect to GitHub - Please try again');
      }
      throw new Error('Unable to connect to the server - Please ensure the backend is running');
    }
    throw error;
  }
};

// Add a function to handle navigations
const navigateTo = (path: string): void => {
  if (isBrowser) {
    // This will be used when no router is available
    window.location.href = path;
  }
};

// Helper function for redirects
export const redirect = (path: string, router?: RouterType): void => {
  if (router) {
    router.push(path);
  } else {
    navigateTo(path);
  }
};

// Helper function to get current path
export const getCurrentPath = (): string => {
  return isBrowser ? window.location.pathname : '';
};

// Helper function to get window origin
export const getOrigin = (): string => {
  return isBrowser ? window.location.origin : '';
};

// Helper function to get search params
export const getSearchParams = (): URLSearchParams => {
  return isBrowser ? new URLSearchParams(window.location.search) : new URLSearchParams('');
};

export const auth = {
  async register(email: string, password: string, displayName: string): Promise<AuthResponse> {
    try {
      console.log('=== REGISTRATION STARTED ===');
      
      // Get user type from storage
      const userType = getCurrentUserType();
      console.log('User type from storage:', userType);
      
      // Set flags based on user type - this is the critical part
      const is_student = userType === USER_TYPES.LEARNER || userType === 'student' || userType === 'learner';
      const is_instructor = userType === USER_TYPES.EARNER || userType === 'instructor' || userType === 'earner';
      
      // Log the actual values being sent
      console.log('Registration flags being sent to backend:', { 
        is_student, 
        is_instructor,
        userType
      });
      
      const requestPayload = { 
        email, 
        password,
        first_name: displayName.split(' ')[0],
        last_name: displayName.split(' ').slice(1).join(' '),
        is_student,
        is_instructor
      };
      
      console.log('Sending registration payload:', JSON.stringify(requestPayload));
      
      const response = await makeRequest(`${API_BASE}/auth/register`, {
        method: 'POST',
        body: JSON.stringify(requestPayload)
      });
      
      const data = await handleResponse(response);
      
      // Log the response from the server
      console.log('Server response flags:', { 
        is_student: data.is_student, 
        is_instructor: data.is_instructor 
      });
      console.log('=== REGISTRATION COMPLETED ===');
      
      if (data.access_token) {
        localStorage.setItem('access_token', data.access_token);
        if (data.expires_in) {
          const expiresAt = Date.now() + (data.expires_in * 1000);
          localStorage.setItem('token_expires_at', expiresAt.toString());
        }

        // Store user type based on API response
        if (data.is_student) {
          sessionStorage.setItem('user_type', USER_TYPES.LEARNER);
        } else if (data.is_instructor) {
          sessionStorage.setItem('user_type', USER_TYPES.EARNER);
        }

        // Store user data
        const userData: User = {
          id: data.user_id,
          display_name: data.display_name,
          email: data.email,
          profile_image: data.profile_image || DEFAULT_AVATAR,
          is_student: data.is_student,
          is_instructor: data.is_instructor,
          user_type: data.is_student ? USER_TYPES.LEARNER : USER_TYPES.EARNER
        };
        localStorage.setItem('user', JSON.stringify(userData));
      }
      return data;
    } catch (error) {
      console.error('Registration error:', error);
      throw new Error(error instanceof Error ? error.message : 'Registration failed - Please try again');
    }
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await makeRequest(`${API_BASE}/auth/login`, {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
      
      const data = await handleResponse(response);
      console.log('Login response:', data);

      if (data.access_token) {
        // Clear existing data
        localStorage.removeItem('user');
        sessionStorage.removeItem('user_type');

        // Store token
        localStorage.setItem('access_token', data.access_token);
        if (data.expires_in) {
          const expiresAt = Date.now() + (data.expires_in * 1000);
          localStorage.setItem('token_expires_at', expiresAt.toString());
        }

        // Store user type based on API response
        if (data.is_student) {
          sessionStorage.setItem('user_type', USER_TYPES.LEARNER);
        } else if (data.is_instructor) {
          sessionStorage.setItem('user_type', USER_TYPES.EARNER);
        }

        // Store user data
        const userData = {
          id: data.user_id,
          display_name: data.display_name,
          email: data.email,
          profile_image: data.profile_image,
          is_student: data.is_student,
          is_instructor: data.is_instructor
        };
        localStorage.setItem('user', JSON.stringify(userData));

        // Store auth token in cookie
        document.cookie = `auth_token=${data.access_token}; path=/; secure; samesite=lax`;
      }
      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw new Error(error instanceof Error ? error.message : 'Login failed - Please check your credentials and try again');
    }
  },

  async logout(): Promise<ApiResponse> {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await makeRequest(`${API_BASE}/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Clear all storage
      localStorage.removeItem('access_token');
      localStorage.removeItem('token_expires_at');
      localStorage.removeItem('user');
      sessionStorage.removeItem('user_type');
      sessionStorage.removeItem('oauth_state');
      sessionStorage.removeItem('redirect_path');
      sessionStorage.removeItem('is_student');
      sessionStorage.removeItem('is_instructor');
      sessionStorage.removeItem('temp_user_type');
      sessionStorage.removeItem('temp_is_student');
      sessionStorage.removeItem('temp_is_instructor');
      
      // Clear cookies
      document.cookie = 'temp_is_student=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      document.cookie = 'temp_is_instructor=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      
      // Clear cache
      userDataCache = null;
      lastUserFetch = 0;
      userDataPromise = null;
      
      return handleResponse(response);
    } catch (error) {
      console.error('Logout error:', error);
      throw new Error(error instanceof Error ? error.message : 'Logout failed - Please try again');
    }
  },

  async getUser(): Promise<User | null> {
    try {
      const currentTime = Date.now();
      
      // Check for access token first
      const accessToken = localStorage.getItem('access_token');
      if (!accessToken) {
        userDataCache = null;
        return null;
      }

      // Check token expiration
      const tokenExpiresAt = localStorage.getItem('token_expires_at');
      if (tokenExpiresAt && parseInt(tokenExpiresAt) < currentTime) {
        // Token expired, clear everything
        localStorage.removeItem('access_token');
        localStorage.removeItem('token_expires_at');
        localStorage.removeItem('user');
        userDataCache = null;
        return null;
      }
      
      // If we have cached data and it's not expired, return it
      if (userDataCache && (currentTime - lastUserFetch) < USER_CACHE_DURATION) {
        return userDataCache;
      }

      // Try to get user data from localStorage first
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser) as User;
          userDataCache = userData;
          lastUserFetch = currentTime;
          return userData;
        } catch {
          console.error('Error parsing stored user data');
        }
      }

      // If there's already a request in progress, wait for it
      if (userDataPromise) {
        return await userDataPromise;
      }

      // Make the request and cache the promise
      userDataPromise = (async () => {
        try {
          const response = await makeRequest(`${API_BASE}/auth/user`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${accessToken}`
            }
          });
          
          const apiResponse = await handleResponse(response);
          // Ensure the response has the required User properties
          const userData: User = {
            id: apiResponse.user_id,
            display_name: apiResponse.display_name,
            email: apiResponse.email,
            profile_image: apiResponse.profile_image || DEFAULT_AVATAR,
            is_student: apiResponse.is_student,
            is_instructor: apiResponse.is_instructor,
            user_type: apiResponse.is_student ? USER_TYPES.LEARNER : USER_TYPES.EARNER
          };
          
          // Update localStorage with fresh data
          localStorage.setItem('user', JSON.stringify(userData));
          
          userDataCache = userData;
          lastUserFetch = currentTime;
          return userData;
        } catch (error) {
          console.error('Error fetching user data:', error);
          // Clear everything on error
          localStorage.removeItem('access_token');
          localStorage.removeItem('token_expires_at');
          localStorage.removeItem('user');
          userDataCache = null;
          return null;
        } finally {
          userDataPromise = null;
        }
      })();

      return await userDataPromise;
    } catch (error) {
      console.error('Error in getUser:', error);
      return null;
    }
  },

  async checkAuth(): Promise<boolean> {
    try {
      // Use the cached user data if available
      const user = await this.getUser();
      return !!user;
    } catch (error) {
      console.error('Error checking auth:', error);
      return false;
    }
  },

  async loginWithGitHub(router?: RouterType): Promise<void> {
    try {
      const state = generateOAuthState('/dashboard');
      
      // Get user type from session storage
      const userType = getCurrentUserType();
      console.log('Current user type before GitHub auth:', userType);
      
      // Store state and user type
      sessionStorage.setItem('oauth_state', state);
      if (isBrowser) {
        sessionStorage.setItem('redirect_path', getCurrentPath());
      }
      sessionStorage.setItem('temp_user_type', userType);
      
      // Store user type in cookies for server-side access
      const is_student = userType === USER_TYPES.LEARNER || userType === 'student' || userType === 'learner';
      const is_instructor = userType === USER_TYPES.EARNER || userType === 'instructor' || userType === 'earner';
      
      console.log('Setting cookie values for GitHub login:', { is_student, is_instructor });
      
      // Set cookies with explicit true/false strings
      document.cookie = `temp_is_student=${is_student ? 'true' : 'false'}; path=/`;
      document.cookie = `temp_is_instructor=${is_instructor ? 'true' : 'false'}; path=/`;
      
      const params = new URLSearchParams({
        client_id: process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID!,
        redirect_uri: `${FRONTEND_URL}/api/auth/callback/github`,
        state,
        scope: 'read:user user:email'
      });

      redirect(`https://github.com/login/oauth/authorize?${params}`, router);
    } catch (error) {
      console.error('Failed to initiate GitHub login:', error);
      throw new Error('Failed to start GitHub login - Please try again');
    }
  },

  async handleGitHubCallback(code: string, state: string): Promise<{ data: AuthResponse; redirectPath: string }> {
    try {
      const storedState = sessionStorage.getItem('oauth_state');
      if (!storedState || state !== storedState) {
        throw new Error('Invalid state - Please try logging in again');
      }
      
      sessionStorage.removeItem('oauth_state');
      const redirectPath = sessionStorage.getItem('redirect_path') || '/dashboard';
      
      // Get user type from temporary storage and convert to flags
      const userType = sessionStorage.getItem('temp_user_type') || USER_TYPES.LEARNER;
      
      // Directly determine user type flags
      const is_student = userType === USER_TYPES.LEARNER || userType === 'student' || userType === 'learner';
      const is_instructor = userType === USER_TYPES.EARNER || userType === 'instructor' || userType === 'earner';
      
      console.log('GitHub callback - user type flags:', { is_student, is_instructor, userType });
      
      const response = await makeRequest(`${API_BASE}/auth/github/callback`, {
        method: 'POST',
        body: JSON.stringify({ 
          code,
          redirect_uri: `${getOrigin()}/api/auth/callback/github`,
          is_student,
          is_instructor
        })
      });
      
      const data = await handleResponse(response);
      
      if (data.access_token) {
        // Store the access token in multiple places for redundancy
        localStorage.setItem('access_token', data.access_token);
        sessionStorage.setItem('access_token', data.access_token);
        
        // Set auth header immediately
        defaultHeaders['Authorization'] = `Bearer ${data.access_token}`;
        
        // Set auth cookie with proper expiration and security
        const maxAge = data.expires_in || 86400; // Default to 24 hours
        const secure = window.location.protocol === 'https:' ? 'Secure;' : '';
        const domain = process.env.COOKIE_DOMAIN || window.location.hostname;
        
        // Set HTTP-only cookie with proper attributes
        document.cookie = `auth_token=${data.access_token}; path=/; max-age=${maxAge}; SameSite=Lax; ${secure} domain=${domain}`;
        
        if (data.expires_in) {
          const expiresAt = Date.now() + (data.expires_in * 1000);
          localStorage.setItem('token_expires_at', expiresAt.toString());
        }

        // Store user type based on API response
        const finalUserType = data.is_student ? USER_TYPES.LEARNER : USER_TYPES.EARNER;
        localStorage.setItem('user_type', finalUserType);
        sessionStorage.setItem('user_type', finalUserType);

        // Store user data
        const userData: User = {
          id: data.user_id,
          display_name: data.display_name,
          email: data.email,
          profile_image: data.profile_image || DEFAULT_AVATAR,
          is_student: data.is_student,
          is_instructor: data.is_instructor,
          user_type: finalUserType
        };
        
        localStorage.setItem('user', JSON.stringify(userData));
        sessionStorage.setItem('user', JSON.stringify(userData));
        
        // Update cache
        userDataCache = userData;
        lastUserFetch = Date.now();
      }
      
      return { data, redirectPath };
    } catch (error) {
      console.error('GitHub callback error:', error);
      throw error;
    }
  },

  async loginWithFacebook(router?: RouterType): Promise<void> {
    try {
      const state = Array.from(crypto.getRandomValues(new Uint8Array(16)))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
      
      // Store current user type flags before redirecting
      const userType = getCurrentUserType();
      console.log('Current user type before Facebook auth:', userType);
      
      if (!userType) {
        throw new Error('Please select whether you are a student or instructor before proceeding');
      }
      
      sessionStorage.setItem('oauth_state', state);
      if (isBrowser) {
        sessionStorage.setItem('redirect_path', getCurrentPath());
      }
      
      // Store user type in cookies for server-side access
      const is_student = userType === USER_TYPES.LEARNER || userType === 'student' || userType === 'learner';
      const is_instructor = userType === USER_TYPES.EARNER || userType === 'instructor' || userType === 'earner';
      
      if (!is_student && !is_instructor) {
        throw new Error('Invalid user type - must be either student or instructor');
      }
      
      console.log('Setting cookie values for Facebook login:', { is_student, is_instructor });
      
      // Set cookies with explicit true/false strings
      document.cookie = `temp_is_student=${is_student ? 'true' : 'false'}; path=/`;
      document.cookie = `temp_is_instructor=${is_instructor ? 'true' : 'false'}; path=/`;
      
      const params = new URLSearchParams({
        client_id: process.env.NEXT_PUBLIC_FACEBOOK_APP_ID!,
        redirect_uri: `${FRONTEND_URL}/api/auth/callback/facebook`,
        state,
        scope: 'email,public_profile'
      });

      redirect(`https://www.facebook.com/v12.0/dialog/oauth?${params}`, router);
    } catch (error) {
      console.error('Failed to initiate Facebook login:', error);
      throw new Error('Failed to start Facebook login - Please try again');
    }
  },

  async handleFacebookCallback(code: string, state: string): Promise<{ data: AuthResponse; redirectPath: string }> {
    try {
      const storedState = sessionStorage.getItem('oauth_state');
      if (!storedState || state !== storedState) {
        throw new Error('Invalid state - Please try logging in again');
      }
      
      sessionStorage.removeItem('oauth_state');
      const redirectPath = sessionStorage.getItem('redirect_path') || '/dashboard';
      
      // Get stored user type and convert to flags
      const userType = sessionStorage.getItem('temp_user_type') || USER_TYPES.LEARNER;
      let is_student = userType === USER_TYPES.LEARNER || userType === 'student' || userType === 'learner';
      let is_instructor = userType === USER_TYPES.EARNER || userType === 'instructor' || userType === 'earner';
      
      // Also check cookies as fallback
      if (!is_student && !is_instructor) {
        // Use cookie values as fallback
        const is_student_cookie = document.cookie.includes('temp_is_student=true');
        const is_instructor_cookie = document.cookie.includes('temp_is_instructor=true');
        
        console.log('Facebook callback - using cookie values:', { is_student_cookie, is_instructor_cookie });
        
        if (is_student_cookie || is_instructor_cookie) {
          // Cookie values found, use them
          is_student = is_student_cookie;
          is_instructor = is_instructor_cookie;
        }
      }
      
      console.log('Facebook callback - final user type flags:', { is_student, is_instructor, userType });
      
      // Clean up all storage
      sessionStorage.removeItem('redirect_path');
      sessionStorage.removeItem('user_type');
      sessionStorage.removeItem('is_student');
      sessionStorage.removeItem('is_instructor');
      sessionStorage.removeItem('temp_user_type');
      sessionStorage.removeItem('temp_is_student');
      sessionStorage.removeItem('temp_is_instructor');
      
      const response = await makeRequest('/api/v1/auth/facebook', {
        method: 'POST',
        body: JSON.stringify({ 
          code,
          redirect_uri: `${FRONTEND_URL}/api/auth/callback/facebook`,
          is_student,
          is_instructor
        })
      });
      
      const data = await handleResponse(response);
      if (data.access_token) {
        // Store the access token in multiple places for redundancy
        localStorage.setItem('access_token', data.access_token);
        sessionStorage.setItem('access_token', data.access_token);
        
        // Set auth header immediately
        defaultHeaders['Authorization'] = `Bearer ${data.access_token}`;
        
        // Set auth cookie with proper expiration and security
        const maxAge = data.expires_in || 86400; // Default to 24 hours
        const secure = window.location.protocol === 'https:' ? 'Secure;' : '';
        const domain = process.env.COOKIE_DOMAIN || window.location.hostname;
        
        // Set HTTP-only cookie with proper attributes
        document.cookie = `auth_token=${data.access_token}; path=/; max-age=${maxAge}; SameSite=Lax; ${secure} domain=${domain}`;
        
        if (data.expires_in) {
          const expiresAt = Date.now() + (data.expires_in * 1000);
          localStorage.setItem('token_expires_at', expiresAt.toString());
        }

        // Store user type based on API response
        const finalUserType = data.is_student ? USER_TYPES.LEARNER : USER_TYPES.EARNER;
        localStorage.setItem('user_type', finalUserType);
        sessionStorage.setItem('user_type', finalUserType);

        // Store user data
        const userData: User = {
          id: data.user_id,
          display_name: data.display_name,
          email: data.email,
          profile_image: data.profile_image || DEFAULT_AVATAR,
          is_student: data.is_student,
          is_instructor: data.is_instructor,
          user_type: finalUserType
        };
        
        localStorage.setItem('user', JSON.stringify(userData));
        sessionStorage.setItem('user', JSON.stringify(userData));
        
        // Update cache
        userDataCache = userData;
        lastUserFetch = Date.now();
      }
      
      return { data, redirectPath };
    } catch (error) {
      console.error('Facebook callback error:', error);
      throw error;
    }
  },

  async loginWithGoogle(router?: RouterType): Promise<void> {
    if (!isBrowser) {
      throw new Error('Google login can only be initiated in browser environment');
    }

    try {
      const state = generateOAuthState('/dashboard');
      
      // Get user type from session storage
      const userType = getCurrentUserType();
      console.log('Current user type before Google auth:', userType);
      
      // Store state and user type
      sessionStorage.setItem('oauth_state', state);
      if (isBrowser) {
        sessionStorage.setItem('redirect_path', getCurrentPath());
      }
      sessionStorage.setItem('temp_user_type', userType);
      
      // Store user type in cookies for server-side access
      const is_student = userType === USER_TYPES.LEARNER || userType === 'student' || userType === 'learner';
      const is_instructor = userType === USER_TYPES.EARNER || userType === 'instructor' || userType === 'earner';
      
      console.log('Setting cookie values for Google login:', { is_student, is_instructor });
      
      // Set cookies with explicit true/false strings
      document.cookie = `temp_is_student=${is_student ? 'true' : 'false'}; path=/`;
      document.cookie = `temp_is_instructor=${is_instructor ? 'true' : 'false'}; path=/`;
      
      const params = new URLSearchParams({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
        redirect_uri: `${FRONTEND_URL}/api/auth/callback/google`,
        response_type: 'code',
        state,
        scope: 'email profile'
      });

      redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`, router);
    } catch (error) {
      console.error('Failed to initiate Google login:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to start Google login - Please try again');
    }
  },

  async handleGoogleCallback(code: string, state: string): Promise<{ data: AuthResponse; redirectPath: string }> {
    if (!isBrowser) {
      throw new Error('OAuth callback can only be handled in browser environment');
    }

    try {
      const storedState = sessionStorage.getItem('oauth_state');
      if (!storedState || state !== storedState) {
        throw new Error('Invalid state - Please try logging in again');
      }
      
      sessionStorage.removeItem('oauth_state');
      const redirectPath = sessionStorage.getItem('redirect_path') || '/dashboard';
      
      // Get user type from temporary storage and convert to flags
      const userType = sessionStorage.getItem('temp_user_type') || USER_TYPES.LEARNER;
      
      // Directly determine user type flags
      const is_student = userType === USER_TYPES.LEARNER || userType === 'student' || userType === 'learner';
      const is_instructor = userType === USER_TYPES.EARNER || userType === 'instructor' || userType === 'earner';
      
      console.log('Google callback - user type flags:', { is_student, is_instructor, userType });
      
      const response = await makeRequest(`${API_BASE}/auth/google/callback`, {
        method: 'POST',
        body: JSON.stringify({ 
          code,
          redirect_uri: `${getOrigin()}/api/auth/callback/google`,
          is_student,
          is_instructor
        })
      });
      
      const data = await handleResponse(response);
      
      if (data.access_token) {
        // Store the access token in multiple places for redundancy
        localStorage.setItem('access_token', data.access_token);
        sessionStorage.setItem('access_token', data.access_token);
        
        // Set auth header immediately
        defaultHeaders['Authorization'] = `Bearer ${data.access_token}`;
        
        // Set auth cookie with proper expiration and security
        const maxAge = data.expires_in || 86400; // Default to 24 hours
        const secure = window.location.protocol === 'https:' ? 'Secure;' : '';
        const domain = process.env.COOKIE_DOMAIN || window.location.hostname;
        
        // Set HTTP-only cookie with proper attributes
        document.cookie = `auth_token=${data.access_token}; path=/; max-age=${maxAge}; SameSite=Lax; ${secure} domain=${domain}`;
        
        if (data.expires_in) {
          const expiresAt = Date.now() + (data.expires_in * 1000);
          localStorage.setItem('token_expires_at', expiresAt.toString());
        }

        // Store user type based on API response
        const finalUserType = data.is_student ? USER_TYPES.LEARNER : USER_TYPES.EARNER;
        localStorage.setItem('user_type', finalUserType);
        sessionStorage.setItem('user_type', finalUserType);

        // Store user data in both storages
        const userData: User = {
          id: data.user_id,
          display_name: data.display_name,
          email: data.email,
          profile_image: data.profile_image || DEFAULT_AVATAR,
          is_student: data.is_student,
          is_instructor: data.is_instructor,
          user_type: finalUserType
        };
        
        localStorage.setItem('user', JSON.stringify(userData));
        sessionStorage.setItem('user', JSON.stringify(userData));
        
        // Update cache
        userDataCache = userData;
        lastUserFetch = Date.now();
      }
      
      // Clean up temporary storage
      sessionStorage.removeItem('redirect_path');
      sessionStorage.removeItem('temp_user_type');
      sessionStorage.removeItem('temp_is_student');
      sessionStorage.removeItem('temp_is_instructor');
      
      return { data, redirectPath };
    } catch (error) {
      console.error('Google callback error:', error);
      // Clean up on error
      localStorage.removeItem('access_token');
      sessionStorage.removeItem('access_token');
      document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      throw error;
    }
  },

  clearUserCache(): void {
    userDataCache = null;
    lastUserFetch = 0;
    userDataPromise = null;
  }
};

export function generateOAuthState(redirectPath = '/dashboard'): string {
  // Guard against server-side execution
  if (typeof window === 'undefined') {
    // Return a placeholder state string that will be replaced on client side
    return JSON.stringify({
      stateId: 'placeholder',
      redirectPath,
      timestamp: 0
    });
  }
  
  const state: OAuthState = {
    stateId: nanoid(),
    redirectPath,
    timestamp: Date.now()
  };
  const stateStr = JSON.stringify(state);
  return stateStr;
}

export function getAuthUrl(provider: 'github' | 'facebook' | 'google', state: string): string {
  const baseUrls = {
    github: 'https://github.com/login/oauth/authorize',
    facebook: 'https://www.facebook.com/v18.0/dialog/oauth',
    google: 'https://accounts.google.com/o/oauth2/v2/auth'
  };

  const clientIds = {
    github: process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID!,
    facebook: process.env.NEXT_PUBLIC_FACEBOOK_APP_ID!,
    google: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!
  };

  const scopes = {
    github: 'read:user user:email',
    facebook: 'email,public_profile',
    google: 'email profile'
  };

  const redirectUris = {
    github: `${FRONTEND_URL}/api/auth/callback/github`,
    facebook: `${FRONTEND_URL}/api/auth/callback/facebook`,
    google: `${FRONTEND_URL}/api/auth/callback/google`
  };

  const url = new URL(baseUrls[provider]);
  url.searchParams.append('client_id', clientIds[provider]);
  url.searchParams.append('redirect_uri', redirectUris[provider]);
  url.searchParams.append('scope', scopes[provider]);
  url.searchParams.append('state', state);
  
  // Add response_type for Google OAuth
  if (provider === 'google') {
    url.searchParams.append('response_type', 'code');
  }

  return url.toString();
}

export function initiateOAuthLogin(provider: 'github' | 'facebook' | 'google', redirectPath = '/student-dashboard', router?: RouterType): void {
  // Guard against server-side execution
  if (typeof window === 'undefined') {
    throw new Error('OAuth login can only be initiated in browser environment');
  }

  try {
    const state = generateOAuthState(redirectPath);
    
    // Store state in sessionStorage
    if (window.sessionStorage) {
      window.sessionStorage.setItem('oauth_state', state);
      
      // Get the current user type
      const userType = getCurrentUserType();
      console.log(`Initiating ${provider} login with user type:`, userType);
      
      // Store for later use
      sessionStorage.setItem('temp_user_type', userType);
      
      // Convert to boolean flags
      const is_student = userType === USER_TYPES.LEARNER || userType === 'student' || userType === 'learner';
      const is_instructor = userType === USER_TYPES.EARNER || userType === 'instructor' || userType === 'earner';
      
      console.log(`Setting ${provider} auth cookie values:`, { is_student, is_instructor });
      
      // Set cookies with explicit true/false strings for all providers
      document.cookie = `temp_is_student=${is_student ? 'true' : 'false'}; path=/`;
      document.cookie = `temp_is_instructor=${is_instructor ? 'true' : 'false'}; path=/`;
    }
    
    const authUrl = getAuthUrl(provider, state);
    redirect(authUrl, router);
  } catch (error) {
    console.error('Failed to initiate OAuth login:', error);
    throw error;
  }
}

// Export individual functions for direct use
export const checkAuth = async (): Promise<boolean> => {
  try {
    const user = await auth.getUser();
    return !!user; // Return true if we have any user data
  } catch (error) {
    console.error('Error checking auth:', error);
    return false;
  }
};

export const getUser = async (): Promise<User | null> => {
  try {
    return await auth.getUser();
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
}; 