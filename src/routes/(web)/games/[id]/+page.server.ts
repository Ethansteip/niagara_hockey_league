import { db } from "$lib/drizzle/index.js";
import { games, teams, teamStandings, arenas } from "$lib/drizzle/schema.js";
import { eq } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { error } from "@sveltejs/kit";

const homeTeam = alias(teams, "homeTeam");
const awayTeam = alias(teams, "awayTeam");
const homeTeamStandings = alias(teamStandings, "homeTeamStandings");
const awayTeamStandings = alias(teamStandings, "awayTeamStandings");

export const load = async (event) => {
  const gameId = parseInt(event.params.id);

  if (isNaN(gameId)) {
    throw error(404, "Game not found");
  }

  const gameResult = await db
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

      // Team info
      homeTeamName: homeTeam.name,
      homeTeamShortName: homeTeam.shortName,
      homeTeamLogoUrl: homeTeam.logoUrl,
      awayTeamName: awayTeam.name,
      awayTeamShortName: awayTeam.shortName,
      awayTeamLogoUrl: awayTeam.logoUrl,

      // Arena info
      arenaName: arenas.name,
      arenaAddress: arenas.address,
      arenaCity: arenas.city,
      arenaProvince: arenas.province,

      // Team standings
      homeTeamStandings: {
        gamesPlayed: homeTeamStandings.gamesPlayed,
        wins: homeTeamStandings.wins,
        losses: homeTeamStandings.losses,
        ties: homeTeamStandings.ties,
        overtimeLosses: homeTeamStandings.overtimeLosses,
        points: homeTeamStandings.points,
        goalsFor: homeTeamStandings.goalsFor,
        goalsAgainst: homeTeamStandings.goalsAgainst,
      },
      awayTeamStandings: {
        gamesPlayed: awayTeamStandings.gamesPlayed,
        wins: awayTeamStandings.wins,
        losses: awayTeamStandings.losses,
        ties: awayTeamStandings.ties,
        overtimeLosses: awayTeamStandings.overtimeLosses,
        points: awayTeamStandings.points,
        goalsFor: awayTeamStandings.goalsFor,
        goalsAgainst: awayTeamStandings.goalsAgainst,
      },
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
    .leftJoin(arenas, eq(games.arenaId, arenas.id))
    .where(eq(games.id, gameId))
    .limit(1);

  if (gameResult.length === 0) {
    throw error(404, "Game not found");
  }

  return { game: gameResult[0] };
};
