import { query } from '$app/server';
import { db } from '$lib/drizzle';
import { games, points, seasons, teams, teamSeasons } from '$lib/drizzle/schema';
import { and, eq, inArray, isNotNull, sum } from 'drizzle-orm';

export type PointsProgressionTeam = {
	id: number;
	name: string;
	/* Season total, i.e. the team's value in the last week */
	points: number;
};

export type PointsProgressionWeek = {
	week: number;
	/* Cumulative points keyed by team id */
	points: Record<number, number>;
};

export type PointsProgression = {
	/* Sorted by points, highest first */
	teams: PointsProgressionTeam[];
	/* Starts with a week 0 baseline where every team has 0 points */
	weeks: PointsProgressionWeek[];
};

const EMPTY: PointsProgression = { teams: [], weeks: [] };

/* Get each team's cumulative regular season points, week by week, for the active season */
export const getPointsProgression = query(async (): Promise<PointsProgression> => {
	const [season] = await db
		.select({ id: seasons.id })
		.from(seasons)
		.where(eq(seasons.active, true))
		.limit(1);

	if (!season) return EMPTY;

	const seasonTeamsQuery = db
		.select({ id: teams.id, name: teams.name })
		.from(teamSeasons)
		.innerJoin(teams, eq(teams.id, teamSeasons.teamId))
		.where(eq(teamSeasons.seasonId, season.id));

	const weeklyPointsQuery = db
		.select({
			week: games.weekNumber,
			teamId: points.teamId,
			points: sum(points.points).mapWith(Number)
		})
		.from(points)
		.innerJoin(games, eq(games.id, points.gameId))
		.where(
			and(
				eq(games.seasonId, season.id),
				eq(games.gameType, 'regular season'),
				inArray(games.status, ['final', 'forfeit']),
				isNotNull(games.weekNumber)
			)
		)
		.groupBy(games.weekNumber, points.teamId);

	const [seasonTeams, weeklyPoints] = await Promise.all([seasonTeamsQuery, weeklyPointsQuery]);

	if (!seasonTeams.length) return EMPTY;

	const totals: Record<number, number> = Object.fromEntries(seasonTeams.map((t) => [t.id, 0]));
	const weekNumbers = [...new Set(weeklyPoints.map((row) => row.week!))].sort((a, b) => a - b);

	const weeks: PointsProgressionWeek[] = [{ week: 0, points: { ...totals } }];
	for (const week of weekNumbers) {
		for (const row of weeklyPoints) {
			if (row.week === week && row.teamId in totals) totals[row.teamId] += row.points;
		}
		weeks.push({ week, points: { ...totals } });
	}

	return {
		teams: seasonTeams
			.map((team) => ({ ...team, points: totals[team.id] }))
			.sort((a, b) => b.points - a.points || a.name.localeCompare(b.name)),
		weeks
	};
});
