// middleware.ts
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Get token and user data from cookies
  const token = request.cookies.get('token')?.value
  const userData = request.cookies.get("cookieData")?.value

  console.log("token",token)
  console.log("userData",userData)

  let user = null
  if (userData) {
    try {
      user = JSON.parse(userData)
    } catch (e) {
      console.error('Failed to parse user data', e)
    }
  }

  // Public routes that don't require authentication
  const publicRoutes = ['/']
  
  // If user is not logged in and trying to access protected route
  if (!token && !publicRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // If user is logged in and trying to access auth pages
  if (token && publicRoutes.includes(pathname)) {
    // Redirect based on role
    if (user?.role === 'Admin') {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url))
    } else if (user?.role === 'User') {
      return NextResponse.redirect(new URL('/user/dashboard', request.url))
    }
  }

  // Handle role-based routing for admin and user paths
  if (token && user) {

   

    // If trying to access /admin or /user root paths
    if (pathname === '/admin' || pathname === '/user' || pathname === '/') {
      const redirectPath = user.role === 'Admin' 
        ? '/admin/dashboard' 
        : '/user/dashboard'
      return NextResponse.redirect(new URL(redirectPath, request.url))
    }

    // Protect admin routes from non-admin users
    if (pathname.startsWith('/admin') && user.role !== 'Admin') {
      return NextResponse.redirect(new URL('/user/dashboard', request.url))
    }

    // Protect user routes from non-user users (if needed)
    if (pathname.startsWith('/user') && user.role !== 'User') {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api routes
     */
    '/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}