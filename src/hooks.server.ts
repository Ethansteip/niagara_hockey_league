import {
  PUBLIC_SUPABASE_URL,
  PUBLIC_SUPABASE_ANON_KEY,
} from "$env/static/public";
import { createServerClient } from "@supabase/ssr";
import { redirect } from "@sveltejs/kit";
import type { Session } from "@supabase/supabase-js";
import { getValidatedSession } from "$lib/utils.js";
import { db } from "$lib/drizzle/index.js";
import { profiles } from "$lib/drizzle/schema.js";
import { eq } from "drizzle-orm";

export const handle = async ({ event, resolve }) => {
  event.locals.supabase = createServerClient(
    PUBLIC_SUPABASE_URL,
    PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll: () => event.cookies.getAll(),
        setAll: (cookies) => {
          cookies.forEach(({ name, value, options }) => {
            event.cookies.set(name, value, { ...options, path: "/" });
          });
        },
      },
    }
  );

  /**
   * We use getSession, as a function, rather than a static object
   * like `session`, in order to make reactivity work for some
   * features of our pages. For example, if this wasn't a function,
   * things like the `update_nickname` form action in /self
   * wouldn't correctly update data on its page.
   */
  event.locals.getSession = async (): Promise<Session | null> => {
    return await getValidatedSession(event.locals.supabase);
  };

  /**
   * Fetch the user's profile from the database based on their session.
   * Returns null if there's no session or no profile found.
   */
  event.locals.getProfile = async () => {
    const session = await event.locals.getSession();
    if (!session) return null;

    const [profile] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, session.user.id))
      .limit(1);

    return profile ?? null;
  };

  const session = await event.locals.getSession();

  /**
   * Only authenticated users can access these paths and their sub-paths.
   *
   * If you'd rather do this in your routes, see (authenticated)/app/+page.server.ts
   * for an example.
   *
   * If you don't use a layout group for auth-protected paths, then you can use
   * new Set(['app', 'self']) or whatever your top-level path segments are, and
   * .has(event.url.pathname.split('/')[1])
   */
  const auth_protected_paths = new Set(["(authenticated)"]);
  if (!session && auth_protected_paths.has(event.route.id?.split("/")[1] || ""))
    redirect(307, "/auth");

  return resolve(event, {
    filterSerializedResponseHeaders(name) {
      return name === "content-range" || name === "x-supabase-api-version";
    },
  });
};
