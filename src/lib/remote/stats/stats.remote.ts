import { query } from '$app/server';
import { db } from '$lib/drizzle';
import {
	games,
	players,
	playerStats,
	rosters,
	rostersPlayers,
	seasons,
	teams,
	teamSeasons
} from '$lib/drizzle/schema';
import { eq, max, sum } from 'drizzle-orm';
import * as z from 'zod';

export type PlayerStatLine = {
	playerId: number;
	/* "J. Smith" */
	displayName: string;
	/* Null when the player isn't on a roster for the season */
	teamName: string | null;
	goals: number;
	assists: number;
	points: number;
	penaltyMinutes: number;
};

/* Standard shape for PlayerStatsTable, so any page can feed it */
export type PlayerStatsTableData = {
	/* Sorted by points, then goals, then last name */
	rows: PlayerStatLine[];
	/* Most recent players_stats.updated_at among the rows, null when there are none */
	lastUpdated: Date | null;
};

const EMPTY: PlayerStatsTableData = { rows: [], lastUpdated: null };

/* Season totals per player. Defaults to the active season; pass teamId to narrow to one roster */
export const getPlayerStats = query(
	z.object({
		seasonId: z.int().optional(),
		teamId: z.int().optional(),
		limit: z.int().optional()
	}),
	async ({ seasonId, teamId, limit }): Promise<PlayerStatsTableData> => {
		if (!seasonId) {
			const [season] = await db
				.select({ id: seasons.id })
				.from(seasons)
				.where(eq(seasons.active, true))
				.limit(1);

			if (!season) return EMPTY;
			seasonId = season.id;
		}

		// Aggregate first so a player on two rosters can't double count their stats
		const totals = db
			.select({
				playerId: playerStats.playerId,
				goals: sum(playerStats.goals).as('goals'),
				assists: sum(playerStats.assists).as('assists'),
				penaltyMinutes: sum(playerStats.penaltyMinutes).as('penalty_minutes'),
				lastUpdated: max(playerStats.updatedAt).as('last_updated')
			})
			.from(playerStats)
			.innerJoin(games, eq(games.id, playerStats.gameId))
			.where(eq(games.seasonId, seasonId))
			.groupBy(playerStats.playerId)
			.as('totals');

		const playerTeams = db
			.select({
				playerId: rostersPlayers.playerId,
				teamId: teams.id,
				teamName: teams.name
			})
			.from(rostersPlayers)
			.innerJoin(rosters, eq(rosters.id, rostersPlayers.rosterId))
			.innerJoin(teamSeasons, eq(teamSeasons.id, rosters.teamSeasonId))
			.innerJoin(teams, eq(teams.id, teamSeasons.teamId))
			.where(eq(teamSeasons.seasonId, seasonId))
			.as('player_teams');

		const results = await db
			.select({
				playerId: players.id,
				firstName: players.firstName,
				lastName: players.lastName,
				teamName: playerTeams.teamName,
				goals: totals.goals,
				assists: totals.assists,
				penaltyMinutes: totals.penaltyMinutes,
				lastUpdated: totals.lastUpdated
			})
			.from(totals)
			.innerJoin(players, eq(players.id, totals.playerId))
			.leftJoin(playerTeams, eq(playerTeams.playerId, totals.playerId))
			.where(teamId ? eq(playerTeams.teamId, teamId) : undefined)
			.orderBy(players.lastName, players.firstName);

		const seen = new Set<number>();
		let lastUpdated: Date | null = null;
		const rows: PlayerStatLine[] = [];

		for (const result of results) {
			// A player rostered on two teams comes back twice; keep the first
			if (seen.has(result.playerId)) continue;
			seen.add(result.playerId);

			const goals = Number(result.goals);
			const assists = Number(result.assists);
			const penaltyMinutes = Number(result.penaltyMinutes);

			// Rows of all zeros mean nothing was actually recorded
			if (!goals && !assists && !penaltyMinutes) continue;

			const updated = result.lastUpdated ? new Date(result.lastUpdated) : null;
			if (updated && (!lastUpdated || updated > lastUpdated)) lastUpdated = updated;

			rows.push({
				playerId: result.playerId,
				displayName: `${result.firstName.charAt(0).toUpperCase()}. ${result.lastName}`,
				teamName: result.teamName,
				goals,
				assists,
				points: goals + assists,
				penaltyMinutes
			});
		}

		// Stable sort, so ties keep the query's last name order
		rows.sort((a, b) => b.points - a.points || b.goals - a.goals);

		return { rows: limit ? rows.slice(0, limit) : rows, lastUpdated };
	}
);
