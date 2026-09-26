import { query, form } from '$app/server';
import { db } from '$lib/drizzle';
import { alias } from 'drizzle-orm/pg-core';
import {
	games,
	seasons,
	standings,
	teams,
	teamSeasons,
	type Game,
	type Team,
	type Standing
} from '$lib/drizzle/schema';
import { eq, and, getTableColumns } from 'drizzle-orm';
import * as z from 'zod';
import { redirect } from '@sveltejs/kit';
import { error } from '@sveltejs/kit';

const homeTeam = alias(teams, 'homeTeam');
const awayTeam = alias(teams, 'awayTeam');

const StatusSchema = z
	.enum(['scheduled', 'in_progress', 'final', 'forfeit', 'cancelled', 'postponed'])
	.nonoptional('Please select a game status');
const TypeSchema = z.enum(['regular season', 'playoff']).nonoptional('Please select a game type');
const DecidedInSchema = z.enum(['regulation', 'overtime', 'shootout']).optional();

const GameFields = z
	.object({
		id: z.int().nonnegative().optional(),
		seasonId: z.string().min(1, 'Please select a season'),
		homeTeamId: z.string().min(1, 'Please select a home team'),
		awayTeamId: z.string().min(1, 'Please select an away team'),
		weekNumber: z
			.int('Please enter a week number')
			.nonnegative('Please enter a non-negative number')
			.nonoptional('Please select a week number'),
		startDate: z.iso.datetime('Select a game date and time'),
		gameStatus: StatusSchema,
		gameType: TypeSchema,
		homeScore: z.int().nonnegative().nonoptional('Please add a home team final score'),
		awayScore: z.int().nonnegative().nonoptional('Please add an away team score.'),
		decidedIn: DecidedInSchema,
		notes: z.string().max(255, 'Note needs to be shorter than 255 characters').optional()
	})
	.refine((data) => data.homeTeamId !== data.awayTeamId, {
		message: 'Home and Away teams cant be the same',
		path: ['awayTeamId']
	});

export type GameData = Game & {
	homeTeam: Team;
	awayTeam: Team;
};

/* Standings row joined with the team's name and code */
export type TeamStanding = Standing & {
	teamName: Team['name'];
	teamCode: Team['code'];
};

export type GameCardData = Game & {
	homeTeam: TeamStanding | undefined;
	awayTeam: TeamStanding | undefined;
};

/* Get all active games - sorted by season start date */
export const getActiveSeasonGames = query(async (): Promise<GameData[]> => {
	return await db
		.select({
			...getTableColumns(games),
			homeTeam,
			awayTeam
		})
		.from(games)
		.innerJoin(seasons, eq(games.seasonId, seasons.id))
		.innerJoin(homeTeam, eq(games.homeTeamId, homeTeam.id))
		.innerJoin(awayTeam, eq(games.awayTeamId, awayTeam.id))
		.where(eq(seasons.active, true))
		.orderBy(games.startDate);
});

/* Get game card data */
export const getGameCardData = query(
	z.object({
		status: StatusSchema,
		limit: z.int().optional()
	}),
	async ({ status, limit = null }): Promise<GameCardData[]> => {
		const [seasonResult] = await db
			.select({ id: seasons.id })
			.from(seasons)
			.where(eq(seasons.active, true))
			.limit(1);

		if (!seasonResult?.id) {
			error(404, 'Active season not found');
		}

		let gameQuery = db
			.select()
			.from(games)
			.where(and(eq(games.seasonId, seasonResult.id), eq(games.status, status)))
			.orderBy(games.startDate)
			.$dynamic();

		if (limit) {
			gameQuery = gameQuery.limit(limit);
		}

		const teamStandingsQuery = db
			.select({
				...getTableColumns(standings),
				teamName: teams.name,
				teamCode: teams.code
			})
			.from(standings)
			.innerJoin(teams, eq(teams.id, standings.teamId))
			.where(eq(standings.seasonId, seasonResult.id));

		const [gamesResult, teamsStandingsResult] = await Promise.all([gameQuery, teamStandingsQuery]);

		if (!gamesResult.length) {
			error(404, 'No games found');
		}

		return gamesResult.map((game) => {
			return {
				...game,
				homeTeam: teamsStandingsResult.find((team) => team.teamId === game.homeTeamId),
				awayTeam: teamsStandingsResult.find((team) => team.teamId === game.awayTeamId)
			};
		});
	}
);

export const getGame = query(
	z.object({
		id: z.int().nonnegative().nonoptional()
	}),
	async ({ id }): Promise<Game> => {
		const [game] = await db.select().from(games).where(eq(games.id, id)).limit(1);
		return game;
	}
);

/* Create new game */
export const createGame = form(
	GameFields,
	async ({
		seasonId,
		homeTeamId,
		awayTeamId,
		weekNumber,
		startDate,
		gameStatus,
		gameType,
		homeScore,
		awayScore,
		decidedIn,
		notes
	}) => {
		const seasonIdInt = parseInt(seasonId, 10);
		const homeTeamIdInt = parseInt(homeTeamId, 10);
		const awayTeamIdInt = parseInt(awayTeamId, 10);

		const [homeTeamSeasonId, awayTeamSeasonId] = await Promise.all([
			getTeamSeasonId(homeTeamIdInt, seasonIdInt),
			getTeamSeasonId(awayTeamIdInt, seasonIdInt)
		]);

		if (!homeTeamSeasonId) {
			console.error('homeTeamSeasonId not found');
			return;
		}

		if (!awayTeamSeasonId) {
			console.error('awayTeamSeasonId not found');
			return;
		}

		await db.insert(games).values({
			seasonId: seasonIdInt,
			homeTeamId: homeTeamIdInt,
			homeTeamSeasonId,
			homeScore,
			awayTeamId: awayTeamIdInt,
			awayTeamSeasonId,
			awayScore,
			gameType,
			startDate: new Date(startDate),
			status: gameStatus,
			weekNumber,
			decidedIn,
			notes
		});

		redirect(303, '/games?created=true');
	}
);

/* Edit an existing game */
export const updateGame = form(
	GameFields,
	async ({
		id,
		seasonId,
		homeTeamId,
		awayTeamId,
		weekNumber,
		startDate,
		gameStatus,
		gameType,
		homeScore,
		awayScore,
		decidedIn,
		notes
	}) => {
		if (!id) {
			throw new Error('Game id is required');
		}

		const seasonIdInt = parseInt(seasonId, 10);
		const homeTeamIdInt = parseInt(homeTeamId, 10);
		const awayTeamIdInt = parseInt(awayTeamId, 10);

		const [homeTeamSeasonId, awayTeamSeasonId] = await Promise.all([
			getTeamSeasonId(homeTeamIdInt, seasonIdInt),
			getTeamSeasonId(awayTeamIdInt, seasonIdInt)
		]);

		if (!homeTeamSeasonId) {
			console.error('homeTeamSeasonId not found');
			return;
		}

		if (!awayTeamSeasonId) {
			console.error('awayTeamSeasonId not found');
			return;
		}

		await db
			.update(games)
			.set({
				seasonId: seasonIdInt,
				homeTeamId: homeTeamIdInt,
				homeTeamSeasonId,
				awayTeamSeasonId,
				awayTeamId: awayTeamIdInt,
				weekNumber,
				startDate: new Date(startDate),
				status: gameStatus,
				gameType,
				homeScore,
				awayScore,
				decidedIn,
				notes
			})
			.where(eq(games.id, id));

		redirect(303, '/games?updated=true');
	}
);

/* Get the team season ids */
const getTeamSeasonId = async (teamId: number, seasonId: number) => {
	const [row] = await db
		.select({ id: teamSeasons.id })
		.from(teamSeasons)
		.where(and(eq(teamSeasons.teamId, teamId), eq(teamSeasons.seasonId, seasonId)))
		.limit(1);

	return row?.id;
};
