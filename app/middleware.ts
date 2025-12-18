import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin")) {
    return NextResponse.redirect(new URL("/admin", req.url));
  }

  if (pathname.startsWith("/parent") && !pathname.startsWith("/parent")) {
    return NextResponse.redirect(new URL("/parent", req.url));
  }

  if (pathname.startsWith("/faculty") && !pathname.startsWith("/faculty")) {
    return NextResponse.redirect(new URL("/faculty", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/parent/:path*", "/faculty/:path*"],
};
