import { query } from "$app/server";
import { db } from "$lib/drizzle/index.js";
import { teamStandings, teams } from "$lib/drizzle/schema";
import { eq, desc } from "drizzle-orm";

export const getStandings = query(async () => {
  const standings = await db
    .select()
    .from(teamStandings)
    .innerJoin(teams, eq(teamStandings.teamId, teams.id))
    .orderBy(desc(teamStandings.points));

  return standings;
});
