import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const API_BASE = `${API_URL}/api/v1`;

interface FacebookCallbackResponse {
  access_token: string;
  user_id: string;
  display_name: string;
  email: string;
  profile_image: string;
  is_student: boolean;
  is_instructor: boolean;
  redirect_path?: string;
  detail?: string;
  message?: string;
}

interface UserData {
  user_id: string;
  display_name: string;
  email: string;
  profile_image: string;
  is_student: boolean;
  is_instructor: boolean;
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');

    if (!code) {
      return NextResponse.redirect(`${request.nextUrl.origin}/?error=NoCodeProvided`);
    }

    // Make the request to the backend directly
    const response = await fetch(`${API_BASE}/auth/facebook/callback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        code,
        redirect_uri: `${request.nextUrl.origin}/api/auth/callback/facebook`
      })
    });

    const data: FacebookCallbackResponse = await response.json();
    console.log('Backend response:', data);
    
    if (!response.ok) {
      const errorMessage = data.detail || data.message || 'Authentication failed';
      console.error('Backend error:', errorMessage);
      throw new Error(errorMessage);
    }

    if (data.access_token) {
      // Fix the redirection logic with proper operator precedence
      const redirectPath = data.redirect_path || (data.is_student ? '/student-dashboard' : '/mentor-dashboard');
      const redirectUrl = new URL(redirectPath, request.nextUrl.origin);
      
      // Create the response first
      const response = NextResponse.redirect(redirectUrl);

      // Set auth token in HTTP-only cookie
      response.cookies.set('auth_token', data.access_token, {
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: 'lax'
      });

      // Also set access_token in URL for client-side storage
      redirectUrl.searchParams.set('token', data.access_token);
      
      // Pass all user data from backend response
      const userData: UserData = {
        user_id: data.user_id,
        display_name: data.display_name,
        email: data.email,
        profile_image: data.profile_image,
        is_student: Boolean(data.is_student),
        is_instructor: Boolean(data.is_instructor)
      };
      
      // Store user data in URL params
      redirectUrl.searchParams.set('user', JSON.stringify(userData));
      
      // Update the response URL with all parameters
      response.headers.set('Location', redirectUrl.toString());
      
      console.log('Redirecting to:', redirectUrl.toString());
      return response;
    }
    
    throw new Error('No access token received from backend');
  } catch (error) {
    console.error('Facebook callback error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Authentication failed';
    const redirectUrl = new URL('/', request.nextUrl.origin);
    redirectUrl.searchParams.set('error', errorMessage);
    return NextResponse.redirect(redirectUrl);
  }
} 