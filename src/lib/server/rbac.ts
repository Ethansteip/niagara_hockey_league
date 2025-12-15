import { db } from "$lib/drizzle/index.js";
import { profiles, rosters, players } from "$lib/drizzle/schema.js";
import { eq, and } from "drizzle-orm";
import type { Profile } from "$lib/drizzle/schema.js";
import { error } from "@sveltejs/kit";

export type UserRole = "player" | "captain" | "admin";

/**
 * Check if a profile has a specific role
 */
export function hasRole(profile: Profile | null, role: UserRole): boolean {
  return profile?.role === role;
}

/**
 * Check if a profile is an admin
 */
export function isAdmin(profile: Profile | null): boolean {
  return profile?.role === "admin";
}

/**
 * Check if a profile is a captain or admin (has elevated permissions)
 */
export function isCaptainOrAdmin(profile: Profile | null): boolean {
  return profile?.role === "captain" || profile?.role === "admin";
}

/**
 * Check if a user is the captain of a specific team season.
 * This checks the roster table to see if the user's linked player
 * has is_captain = true for the given team_season_id.
 */
export async function isCaptainOfTeamSeason(
  profile: Profile | null,
  teamSeasonId: number
): Promise<boolean> {
  if (!profile) return false;
  if (isAdmin(profile)) return true; // Admins have access to everything

  // Find if there's a roster entry where the player's profile_id
  // matches the current user's profile and they are a captain on this team
  const result = await db
    .select({ id: rosters.id })
    .from(rosters)
    .innerJoin(players, eq(rosters.playerId, players.id))
    .where(
      and(
        eq(rosters.teamSeasonId, teamSeasonId),
        eq(rosters.isCaptain, true),
        eq(players.profileId, profile.id)
      )
    )
    .limit(1);

  return result.length > 0;
}

/**
 * Get all team_season_ids where the user is a captain
 */
export async function getCaptainTeamSeasonIds(
  profile: Profile | null
): Promise<number[]> {
  if (!profile) return [];

  const result = await db
    .select({ teamSeasonId: rosters.teamSeasonId })
    .from(rosters)
    .innerJoin(players, eq(rosters.playerId, players.id))
    .where(and(eq(rosters.isCaptain, true), eq(players.profileId, profile.id)));

  return result.map((r) => r.teamSeasonId);
}

/**
 * Require a specific role, throwing a 403 error if not met
 */
export function requireRole(profile: Profile | null, role: UserRole): void {
  if (!hasRole(profile, role)) {
    throw error(403, `This action requires ${role} permissions`);
  }
}

/**
 * Require admin role, throwing a 403 error if not met
 */
export function requireAdmin(profile: Profile | null): void {
  if (!isAdmin(profile)) {
    throw error(403, "This action requires admin permissions");
  }
}

/**
 * Require captain or admin role, throwing a 403 error if not met
 */
export function requireCaptainOrAdmin(profile: Profile | null): void {
  if (!isCaptainOrAdmin(profile)) {
    throw error(403, "This action requires captain or admin permissions");
  }
}

/**
 * Require that the user can edit a specific team's data
 * (must be admin or captain of that team)
 */
export async function requireCanEditTeam(
  profile: Profile | null,
  teamSeasonId: number
): Promise<void> {
  if (isAdmin(profile)) return;

  const canEdit = await isCaptainOfTeamSeason(profile, teamSeasonId);
  if (!canEdit) {
    throw error(
      403,
      "You must be a captain of this team or an admin to perform this action"
    );
  }
}

/**
 * Check if user can update their own profile
 */
export function canUpdateOwnProfile(
  profile: Profile | null,
  targetUserId: string
): boolean {
  if (!profile) return false;
  if (isAdmin(profile)) return true;
  return profile.userId === targetUserId;
}

/**
 * Require that the user can update a profile
 */
export function requireCanUpdateProfile(
  profile: Profile | null,
  targetUserId: string
): void {
  if (!canUpdateOwnProfile(profile, targetUserId)) {
    throw error(403, "You can only update your own profile");
  }
}
