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
 * Get the current user, supporting both cookie-based auth (browser)
 * and Bearer token auth (API clients / testing).
 */
export async function getServerUser(): Promise<{
  id: string;
  email?: string;
} | null> {
  const supabase = await createServerSupabase();

  // 1. Try Bearer token first
  const headersList = await headers();
  const authHeader = headersList.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);
    if (user && !error) return user;
  }

  // 2. Fall back to cookie-based session
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) return user;

  return null;
}
