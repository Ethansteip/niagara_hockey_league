import { db } from "$lib/drizzle/index.js";
import { games, teams } from "$lib/drizzle/schema.js";
import { eq } from "drizzle-orm";

export const load = async (event) => {
  const gamesResult = await db
    .select()
    .from(games)
    .innerJoin(teams, eq(games.homeTeamSeasonId, teams.id));
  return { games: gamesResult };
};
