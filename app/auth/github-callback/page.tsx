'use client';

import { useEffect, useState, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useOnboarding } from '@/state/context/login/OnboardingContext';
import dynamic from 'next/dynamic';

// Create a simple loading spinner component inline
const LoadingSpinner = () => {
  return (
    <div className="flex justify-center items-center">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-700"></div>
    </div>
  );
};

// Client component with search params
const GitHubCallbackHandler = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser, setIsAuthenticated, setToken } = useOnboarding();
  const [isProcessing, setIsProcessing] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Use existing code
  useEffect(() => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const sessionError = searchParams.get('error');
    
    // Check for token in URL (passed from server component)
    const token = searchParams.get('token');
    const userParam = searchParams.get('user');

    if (sessionError) {
      setErrorMessage(sessionError);
      setIsProcessing(false);
      timeoutRef.current = setTimeout(() => {
        router.push('/login?error=' + encodeURIComponent(sessionError));
      }, 3000);
      return;
    }

    if (token && userParam) {
      // This means we're already authenticated and just need to set the state
      try {
        const userData = JSON.parse(userParam);
        setToken(token);
        setUser(userData);
        setIsAuthenticated(true);
        setIsProcessing(false);
        // Remove token from URL for security
        router.replace('/student-dashboard');
        return;
      } catch (error) {
        console.error('Failed to process user data:', error);
        setErrorMessage('Failed to process user data');
        setIsProcessing(false);
        timeoutRef.current = setTimeout(() => {
          router.push('/login?error=Invalid user data');
        }, 3000);
        return;
      }
    }

    if (!code || !state) {
      setErrorMessage('Missing required parameters');
      setIsProcessing(false);
      timeoutRef.current = setTimeout(() => {
        router.push('/login?error=No authorization code received from GitHub');
      }, 3000);
      return;
    }

    // Process GitHub authentication with the code
    const handleAuth = async () => {
      try {
        // We're letting the server component handle the OAuth exchange
        // Just redirect to the dashboard, server component already set cookies
        router.push('/student-dashboard');
      } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : 'Authentication failed. Please try again.';
        setErrorMessage(errorMsg);
        setIsProcessing(false);
        timeoutRef.current = setTimeout(() => {
          router.push('/login?error=' + encodeURIComponent(errorMsg));
        }, 3000);
      }
    };

    handleAuth();

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [searchParams, router, setIsAuthenticated, setToken, setUser]);

  if (errorMessage) {
    return (
      <div className="text-red-500 text-center">
        <p>{errorMessage}</p>
        <p className="text-sm mt-2">Redirecting to login page...</p>
      </div>
    );
  }

  // Use isProcessing variable here
  if (isProcessing) {
    return <LoadingSpinner />;
  }
  
  return null; // Fallback return
};

// Dynamically import the handler component with SSR disabled
const DynamicCallbackHandler = dynamic(() => Promise.resolve(GitHubCallbackHandler), {
  ssr: false,
});

export default function GitHubCallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-2xl font-bold mb-4 text-center">GitHub Authentication</h1>
        <p className="text-gray-600 text-center mb-8">Processing your GitHub login...</p>
        
        <Suspense fallback={<LoadingSpinner />}>
          <DynamicCallbackHandler />
        </Suspense>
      </div>
    </div>
  );
} 