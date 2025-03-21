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

  // Check if the path is protected
  const isProtectedPath = protectedPaths.some(protectedPath => 
    path.startsWith(protectedPath)
  )

  if (isProtectedPath) {
    // Check for token in URL parameters (for initial redirect)
    const token = request.nextUrl.searchParams.get('token')
    
    // Get the token from the cookies
    const authToken = request.cookies.get('auth_token')

    // Allow access if either token exists
    if (!authToken && !token) {
      // Create the login URL with the return path
      const loginUrl = new URL('/login', request.url)
      // Store the full URL including any query parameters
      loginUrl.searchParams.set('redirect', request.nextUrl.pathname + request.nextUrl.search)
      
      // Redirect to login page with the return URL
      return NextResponse.redirect(loginUrl)
    }
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