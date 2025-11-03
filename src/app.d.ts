import { SupabaseClient, Session } from "@supabase/supabase-js";
import { Database } from "./DatabaseDefinitions";
import type { Profile } from "$lib/drizzle/schema";

declare global {
  namespace App {
    interface Locals {
      supabase: SupabaseClient<Database>;
      getSession(): Promise<Session | null>;
      getProfile(): Promise<Profile | null>;
    }
    interface PageData {
      session: Session | null;
      profile: Profile | null;
      supabase: SupabaseClient;
    }
    // interface Error {}
    // interface Platform {}
  }
}

export {};
