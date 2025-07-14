import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const API_BASE = `${API_URL}/api/v1`;

interface GoogleCallbackResponse {
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

    if (!code) {
      return NextResponse.redirect(`${request.nextUrl.origin}/?error=NoCodeProvided`);
    }

    // Get user type from cookies since we can't access sessionStorage in server component
    const cookieStore = await cookies();
    const isStudent = cookieStore.get('temp_is_student');
    const isInstructor = cookieStore.get('temp_is_instructor');

    console.log('Cookie values in callback:', { 
      isStudent: isStudent?.value,
      isInstructor: isInstructor?.value
    });

    // Convert cookie values to proper booleans
    const isStudentBool = isStudent?.value === 'true';
    const isInstructorBool = isInstructor?.value === 'true';

    console.log('Converted boolean values:', {
      isStudentBool,
      isInstructorBool
    });

    // Validate that at least one user type is true
    if (!isStudentBool && !isInstructorBool) {
      console.error('No valid user type found in cookies');
      return NextResponse.redirect(`${request.nextUrl.origin}/?error=${encodeURIComponent('Please select whether you are a student or instructor')}`);
    }

    // Make the request to the backend directly
    const response = await fetch(`${API_BASE}/auth/google/callback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        code,
        redirect_uri: `${request.nextUrl.origin}/api/auth/callback/google`,
        is_student: isStudentBool,
        is_instructor: isInstructorBool
      })
    });

    const data: GoogleCallbackResponse = await response.json();
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

      // Set a stronger max-age for the cookie to ensure it persists
      const maxAge = 24 * 60 * 60; // 24 hours in seconds
      
      // Set auth token in HTTP-only cookie
      response.cookies.set('auth_token', data.access_token, {
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: 'lax',
        maxAge: maxAge
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
      
      // Clean up temporary cookies
      response.cookies.delete('temp_is_student');
      response.cookies.delete('temp_is_instructor');
      
      // Add a flag to indicate this is an OAuth callback redirect
      redirectUrl.searchParams.set('oauth_redirect', 'true');
      
      // Update the response URL with all parameters
      response.headers.set('Location', redirectUrl.toString());
      
      console.log('Redirecting to:', redirectUrl.toString());
      return response;
    }
    
    throw new Error('No access token received from backend');
  } catch (error) {
    console.error('Google callback error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Authentication failed';
    const redirectUrl = new URL('/', request.nextUrl.origin);
    redirectUrl.searchParams.set('error', errorMessage);
    return NextResponse.redirect(redirectUrl);
  }
} 