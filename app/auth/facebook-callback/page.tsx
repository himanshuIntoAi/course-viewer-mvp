'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface FacebookCallbackResponse {
  access_token: string;
  user?: {
    id: string;
    display_name: string;
    email: string;
    profile_image: string;
  };
  is_student?: boolean;
  redirect_path?: string;
  detail?: string;
}

interface StateData {
  redirectPath?: string;
}

const FacebookCallbackPage: React.FC = () => {
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');
        const state = params.get('state');
        const error = params.get('error');
        const error_description = params.get('error_description');

        if (error) {
          throw new Error(error_description || 'Facebook authentication failed');
        }

        if (!code) {
          throw new Error('No code received from Facebook');
        }

        // Call FastAPI backend for Facebook authentication
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/facebook/callback`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            code,
            redirect_uri: `${window.location.origin}/auth/facebook-callback`, // Updated redirect URI
            state
          }),
          credentials: 'include'
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.detail || 'Authentication failed');
        }

        const data: FacebookCallbackResponse = await response.json();
        
        // Store the token in localStorage
        if (data.access_token) {
          localStorage.setItem('auth_token', data.access_token);
          if (data.user) {
            localStorage.setItem('user', JSON.stringify(data.user));
          }
        }

        // Get redirect path from state or use default
        let redirectPath = data.is_student ? '/student-dashboard' : '/mentor-dashboard';
        if (state) {
          try {
            const stateData: StateData = JSON.parse(decodeURIComponent(state));
            redirectPath = stateData.redirectPath || data.is_student ? '/student-dashboard' : '/mentor-dashboard';
          } catch (error) {
            console.error('Failed to parse state:', error);
          }
        }

        // Use redirect path from response if provided, otherwise use the one from state
        router.push(data.redirect_path || redirectPath);
      } catch (error) {
        console.error('Facebook callback error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Authentication failed';
        router.push(`/?error=${encodeURIComponent(errorMessage)}`);
      }
    };

    handleCallback();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Completing Facebook login...</p>
      </div>
    </div>
  );
};

export default FacebookCallbackPage; 