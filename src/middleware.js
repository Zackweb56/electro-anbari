import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const { pathname } = req.nextUrl;

    // If user is authenticated and tries to access login/setup, redirect to dashboard
    if (token && (pathname.startsWith('/admin/login') || pathname.startsWith('/admin/setup'))) {
      return NextResponse.redirect(new URL('/admin/dashboard', req.url));
    }

    // If user is not authenticated and tries to access protected admin routes (except login/setup), redirect to login
    if (!token && pathname.startsWith('/admin') && 
        !pathname.startsWith('/admin/login') && 
        !pathname.startsWith('/admin/setup')) {
      return NextResponse.redirect(new URL('/admin/login', req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;
        
        // Allow access to auth pages without token
        if (pathname.startsWith('/admin/login') || 
            pathname.startsWith('/admin/setup')) {
          return true;
        }
        
        // Protect all other admin routes
        if (pathname.startsWith('/admin')) {
          return !!token;
        }
        
        return true;
      },
    },
  }
);

export const config = {
  matcher: ['/admin/:path*']
};