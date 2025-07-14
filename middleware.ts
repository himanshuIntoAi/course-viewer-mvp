import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Add the paths that need authentication
const protectedPaths = [
  '/student-dashboard',
  '/mentor-dashboard'
]

export function middleware(request: NextRequest) {
  // Get the pathname of the request (e.g. /, /protected)
  const path = request.nextUrl.pathname
  const url = new URL(request.url)

  // Check if the path is protected
  const isProtectedPath = protectedPaths.some(protectedPath => 
    path.startsWith(protectedPath)
  )

  if (isProtectedPath) {
    // Check for token in URL parameters (for initial redirect)
    const token = url.searchParams.get('token')
    
    // Get the token from the cookies
    const authToken = request.cookies.get('auth_token')
    
    // If we have a token in either cookies or URL, allow access
    if (authToken || token) {
      // If we have a token in URL but not in cookies, set it in cookies
      if (token && !authToken) {
        const response = NextResponse.next()
        
        // Set a stronger cookie that will persist
        response.cookies.set('auth_token', token, {
          path: '/',
          secure: process.env.NODE_ENV === 'production',
          httpOnly: true,
          sameSite: 'lax',
          maxAge: 24 * 60 * 60 // 24 hours
        })
        
        return response
      }
      
      // We have a token in cookies, allow access
      return NextResponse.next()
    }
    
    // No authentication - redirect to login
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', url.pathname + url.search)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

// Configure the paths that need to be handled by this middleware
export const config = {
  matcher: [
    '/student-dashboard/:path*',
    '/mentor-dashboard/:path*'
  ]
} 