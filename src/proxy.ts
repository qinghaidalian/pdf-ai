import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Routes that don't require authentication
const PUBLIC_PATHS = ["/", "/pricing", "/login", "/signup"];
const PUBLIC_PREFIXES = [
  "/api/webhooks",
  "/api/auth",
  "/templates",
];

export async function proxy(request: NextRequest) {
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

  // Create response and check session
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  let user = null;

  // 1. Try cookie-based session first
  const {
    data: { user: cookieUser },
  } = await supabase.auth.getUser();
  user = cookieUser;

  // 2. Fall back to Bearer token (for API clients)
  if (!user) {
    const authHeader = request.headers.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.slice(7);
      const {
        data: { user: tokenUser },
      } = await supabase.auth.getUser(token);
      user = tokenUser;
    }
  }

  if (!user) {
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

  return supabaseResponse;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
