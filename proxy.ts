import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

// Pages that logged-in users should NOT be able to visit
const AUTH_ROUTES = ["/login", "/signup"];

// Pages that require a logged-in session
const PROTECTED_ROUTES = ["/dashboard", "/workout", "/history", "/goals"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const session = await auth.api.getSession({
    headers: request.headers,
  });

  const isLoggedIn = !!session;
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));
  const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route),
  );

  // If logged in and trying to visit /login or /signup → send to dashboard
  if (isLoggedIn && isAuthRoute) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // If NOT logged in and trying to visit a protected page → send to login
  if (!isLoggedIn && isProtectedRoute) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all paths EXCEPT:
     * - api routes
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - public folder files (images, fonts etc)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
};
