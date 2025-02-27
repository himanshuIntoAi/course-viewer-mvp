'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useOnboarding } from '@/state/context/login/OnboardingContext';

interface StateData {
  redirectPath?: string;
}

interface GitHubCallbackResponse {
  access_token: string;
  detail?: string;
}

const GitHubCallbackPage: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const onboarding = useOnboarding();
  const { setToken, setIsAuthenticated, fetchUserData } = onboarding;
  
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const processedCodeRef = useRef<string | null>(null);
  const isMounted = useRef<boolean>(true);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    const processGithubCallback = async () => {
      const code = searchParams.get('code');
      const state = searchParams.get('state');
      
      console.log('Processing GitHub callback with code:', code);

      // Early return conditions
      if (!code || !state) {
        console.log('No code or state found');
        setError('Invalid callback parameters');
        setIsLoading(false);
        return;
      }

      // Check if we've already processed this code
      if (processedCodeRef.current === code) {
        console.log('Code already processed:', code);
        setIsLoading(false);
        return;
      }

      try {
        // Mark code as being processed
        processedCodeRef.current = code;
        
        console.log('Making request to backend');
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/github/callback`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            code,
            redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/auth/github-callback`, // Updated redirect URI
            state
          }),
          credentials: 'include' // Added to ensure cookies are sent
        });

        if (!isMounted.current) return;

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || 'Authentication failed');
        }

        const data: GitHubCallbackResponse = await response.json();
        console.log('Received response from backend');

        if (!isMounted.current) return;

        // Set authentication state
        setToken(data.access_token);
        setIsAuthenticated(true);
        
        // Fetch user data
        console.log('Fetching user data');
        await fetchUserData();

        if (!isMounted.current) return;

        // Handle redirect
        let redirectPath = '/dashboard';
        if (state) {
          try {
            const stateData: StateData = JSON.parse(decodeURIComponent(state));
            if (stateData.redirectPath) {
              redirectPath = stateData.redirectPath;
            }
          } catch (e) {
            console.warn('Error parsing state:', e);
          }
        }

        console.log('Redirecting to:', redirectPath);
        router.push(redirectPath); // Using Next.js router instead of window.location

      } catch (error) {
        console.error('Authentication error:', error);
        if (isMounted.current) {
          const errorMessage = error instanceof Error ? error.message : 'Authentication failed';
          setError(errorMessage);
          setToken(null);
          setIsAuthenticated(false);
          router.push(`/?error=${encodeURIComponent(errorMessage)}`);
        }
      } finally {
        if (isMounted.current) {
          setIsLoading(false);
        }
      }
    };

    processGithubCallback();
  }, [searchParams, setToken, setIsAuthenticated, fetchUserData, router]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-4 text-red-600">Authentication Error</h1>
          <p className="text-gray-600">{error}</p>
          <button 
            onClick={() => {
              processedCodeRef.current = null;
              router.push('/');
            }}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-4">Authenticating with GitHub</h1>
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Please wait while we complete your authentication...</p>
        </div>
      </div>
    );
  }

  return null;
};

export default GitHubCallbackPage; 