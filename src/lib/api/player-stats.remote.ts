import { query } from "$app/server";
import { db } from "$lib/drizzle/index.js";
import { rosters, players } from "$lib/drizzle/schema";
import { eq, desc } from "drizzle-orm";

export const getPlayerStats = query(async () => {
  const stats = await db
    .select({
      firstName: players.firstName,
      lastName: players.lastName,
      teamSeasonId: rosters.teamSeasonId,
      goals: rosters.goals,
      assists: rosters.assists,
      points: rosters.points,
      pims: rosters.pims,
    })
    .from(rosters)
    .innerJoin(players, eq(rosters.playerId, players.id))
    .where(eq(rosters.role, "player"))
    .orderBy(desc(rosters.points));

  return stats;
});
