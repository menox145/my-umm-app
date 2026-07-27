import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const userData = request.cookies.get("user_data");
  const { pathname } = request.nextUrl;

  const isAuthenticated = !!userData?.value;

  if (pathname.startsWith("/dashboard") && !isAuthenticated) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (pathname === "/login" && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (pathname === "/" && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/login/:path*", "/dashboard/:path*"],
};