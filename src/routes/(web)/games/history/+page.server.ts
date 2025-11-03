import { db } from "$lib/drizzle/index.js";
import { games, teams, teamStandings } from "$lib/drizzle/schema.js";
import { eq, desc } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

const homeTeam = alias(teams, "homeTeam");
const awayTeam = alias(teams, "awayTeam");
const homeTeamStandings = alias(teamStandings, "homeTeamStandings");
const awayTeamStandings = alias(teamStandings, "awayTeamStandings");

export const load = async (event) => {
  const gamesResult = await db
    .select({
      // Game fields
      id: games.id,
      seasonId: games.seasonId,
      divisionId: games.divisionId,
      weekNumber: games.weekNumber,
      startsAt: games.startsAt,
      arenaId: games.arenaId,
      homeTeamSeasonId: games.homeTeamSeasonId,
      awayTeamSeasonId: games.awayTeamSeasonId,
      status: games.status,
      homeScore: games.homeScore,
      awayScore: games.awayScore,
      decidedIn: games.decidedIn,
      notes: games.notes,
      createdAt: games.createdAt,
      // Team names
      homeTeamName: homeTeam.name,
      homeTeamShortName: homeTeam.shortName,
      homeTeamLogoUrl: homeTeam.logoUrl,
      awayTeamName: awayTeam.name,
      awayTeamShortName: awayTeam.shortName,
      awayTeamLogoUrl: awayTeam.logoUrl,
      // team standings
      homeTeamStandings: homeTeamStandings,
      awayTeamStandings: awayTeamStandings,
    })
    .from(games)
    .innerJoin(homeTeam, eq(games.homeTeamId, homeTeam.id))
    .innerJoin(awayTeam, eq(games.awayTeamId, awayTeam.id))
    .innerJoin(
      homeTeamStandings,
      eq(games.homeTeamId, homeTeamStandings.teamId)
    )
    .innerJoin(
      awayTeamStandings,
      eq(games.awayTeamId, awayTeamStandings.teamId)
    )
    .where(eq(games.status, "final"))
    .orderBy(desc(games.startsAt));

  return { games: gamesResult };
};
