import { NextResponse, type NextRequest } from "next/server";

// Routes that don't require authentication
const PUBLIC_PATHS = ["/", "/pricing", "/login", "/signup"];
const PUBLIC_PREFIXES = [
  "/api/webhooks",
  "/api/auth",
  "/templates",
  "/api/checkout",
];

/**
 * Middleware — lightweight, synchronous, NO Supabase SDK.
 *
 * We intentionally do NOT parse JWT tokens or create Supabase clients here.
 * That work is deferred to API routes (getServerUser) and page layouts.
 * This avoids low-level Headers.append crashes caused by corrupted cookies.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths (exact match or sub-routes)
  if (PUBLIC_PATHS.includes(pathname)) return NextResponse.next();
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p + "/")))
    return NextResponse.next();
  if (PUBLIC_PREFIXES.some((p) => pathname.startsWith(p)))
    return NextResponse.next();

  // Allow static files and Next.js internals
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/og-images") ||
    pathname.match(/\.(svg|png|jpg|jpeg|gif|ico|webp|css|js)$/)
  ) {
    return NextResponse.next();
  }

  // Check for Supabase auth cookies by NAME only — never parse values.
  // Supabase SSR stores tokens in cookies named like:
  //   sb-<ref>-auth-token / sb-<ref>-auth-token.0 / sb-<ref>-auth-token.1 …
  const hasAuthCookie = request.cookies
    .getAll()
    .some((c) => c.name.includes("auth-token"));

  if (!hasAuthCookie) {
    // API routes return 401 JSON
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { error: "UNAUTHORIZED", message: "请先登录" },
        { status: 401 }
      );
    }
    // Page routes redirect to login
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
