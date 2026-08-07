import { createServerClient } from "@supabase/ssr";
import { cookies, headers } from "next/headers";

export async function createServerSupabase() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {}
        },
      },
    }
  );
}

/**
 * Get the current user via Bearer token ONLY.
 * NO cookie-based auth fallback — avoids Headers.append crashes
 * caused by corrupted JWT in Supabase session cookies.
 *
 * Client must pass the access_token from the browser's Supabase
 * session (stored in localStorage, not the corrupted cookie).
 */
export async function getServerUser(): Promise<{
  id: string;
  email?: string;
} | null> {
  try {
    const headersList = await headers();
    const authHeader = headersList.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return null; // No Bearer token → unauthenticated (no cookie fallback)
    }

    const token = authHeader.slice(7);
    // Use a fresh Supabase client to validate the token.
    // This does NOT read cookies — getUser(jwt) calls Supabase Auth
    // directly with the provided token.
    const supabase = await createServerSupabase();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (user && !error) return user;
    return null;
  } catch (err) {
    console.error("getServerUser error (treated as unauthenticated):", err);
    return null;
  }
}
