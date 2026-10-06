import { query, form } from '$app/server';
import { db } from '$lib/drizzle';
import { alias } from 'drizzle-orm/pg-core';
import {
	games,
	goalieGames,
	playerStats,
	points,
	seasons,
	standings,
	teams,
	teamSeasons,
	type Game,
	type GoalieGame,
	type PlayerStat,
	type Team,
	type Standing
} from '$lib/drizzle/schema';
import { eq, and, or, asc, desc, inArray, notInArray, getTableColumns, sql } from 'drizzle-orm';
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

const GameBase = z.object({
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
});

const differentTeams = (data: { homeTeamId: string; awayTeamId: string }) =>
	data.homeTeamId !== data.awayTeamId;
const differentTeamsIssue = {
	message: 'Home and Away teams cant be the same',
	path: ['awayTeamId']
};

const GameFields = GameBase.refine(differentTeams, differentTeamsIssue);

const StatLine = z.object({
	playerId: z.int().nonnegative(),
	goals: z.int().nonnegative('Goals cant be negative'),
	assists: z.int().nonnegative('Assists cant be negative'),
	penaltyMinutes: z.int().nonnegative('Penalty minutes cant be negative')
});

/* A goalie's player id, or 'sub' when a substitute played */
const GoalieChoice = z.union([z.literal('sub'), z.string().regex(/^\d+$/)]).optional();

const UpdateGameFields = GameBase.extend({
	playerStats: z.array(StatLine).optional(),
	homeGoalieId: GoalieChoice,
	awayGoalieId: GoalieChoice
}).refine(differentTeams, differentTeamsIssue);

/* Statuses where the score is official and counts toward points and standings */
const COUNTED_STATUSES: Game['status'][] = ['final', 'forfeit'];

/* League points awarded per result */
const POINTS = { win: 2, tie: 1, loss: 0 } as const;

type Result = keyof typeof POINTS;

const getResult = (goalsFor: number, goalsAgainst: number): Result =>
	goalsFor > goalsAgainst ? 'win' : goalsFor < goalsAgainst ? 'loss' : 'tie';

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
		limit: z.int().optional(),
		order: z.enum(['asc', 'desc']).optional()
	}),
	async ({ status, limit = null, order = 'asc' }): Promise<GameCardData[]> => {
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
			.orderBy(order === 'desc' ? desc(games.startDate) : asc(games.startDate))
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

export type GameStats = {
	playerStats: PlayerStat[];
	goalies: GoalieGame[];
};

/* Player stat lines and goalies already recorded for a game */
export const getGameStats = query(
	z.object({
		gameId: z.int().nonnegative().nonoptional()
	}),
	async ({ gameId }): Promise<GameStats> => {
		const [statsResult, goaliesResult] = await Promise.all([
			db.select().from(playerStats).where(eq(playerStats.gameId, gameId)),
			db.select().from(goalieGames).where(eq(goalieGames.gameId, gameId))
		]);

		return { playerStats: statsResult, goalies: goaliesResult };
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

/* Edit an existing game, along with its player stats, goalies, points and standings */
export const updateGame = form(
	UpdateGameFields,
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
		notes,
		playerStats: statLines,
		homeGoalieId,
		awayGoalieId
	}) => {
		if (!id) {
			error(400, 'Game id is required');
		}

		const seasonIdInt = parseInt(seasonId, 10);
		const homeTeamIdInt = parseInt(homeTeamId, 10);
		const awayTeamIdInt = parseInt(awayTeamId, 10);

		const [existingGame, homeTeamSeasonId, awayTeamSeasonId] = await Promise.all([
			db
				.select()
				.from(games)
				.where(eq(games.id, id))
				.limit(1)
				.then(([row]) => row),
			getTeamSeasonId(homeTeamIdInt, seasonIdInt),
			getTeamSeasonId(awayTeamIdInt, seasonIdInt)
		]);

		if (!existingGame) {
			error(404, `Game with id ${id} not found`);
		}

		if (!homeTeamSeasonId) {
			error(400, 'Home team is not part of the selected season');
		}

		if (!awayTeamSeasonId) {
			error(400, 'Away team is not part of the selected season');
		}

		const counted = COUNTED_STATUSES.includes(gameStatus);

		await db.transaction(async (tx) => {
			await tx
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
					// Only a finished game has a result to have been decided in
					decidedIn: counted ? (decidedIn ?? 'regulation') : null,
					notes,
					updatedAt: new Date()
				})
				.where(eq(games.id, id));

			/* Player stats */
			if (statLines) {
				// Keep the last line per player, and only lines with something recorded,
				// so zeroing a player out removes their row instead of storing zeros
				const lines = [...new Map(statLines.map((line) => [line.playerId, line])).values()].filter(
					(line) => line.goals || line.assists || line.penaltyMinutes
				);

				const playerIds = lines.map((line) => line.playerId);

				await tx
					.delete(playerStats)
					.where(
						and(
							eq(playerStats.gameId, id),
							playerIds.length ? notInArray(playerStats.playerId, playerIds) : undefined
						)
					);

				if (lines.length) {
					await tx
						.insert(playerStats)
						.values(lines.map((line) => ({ ...line, gameId: id })))
						.onConflictDoUpdate({
							target: [playerStats.playerId, playerStats.gameId],
							set: {
								goals: sql`excluded.goals`,
								assists: sql`excluded.assists`,
								penaltyMinutes: sql`excluded.penalty_minutes`,
								updatedAt: new Date()
							}
						});
				}
			}

			/* Goalies - one row per team, with a null player id when a sub played */
			const goalieRows = [
				{ choice: homeGoalieId, teamId: homeTeamIdInt },
				{ choice: awayGoalieId, teamId: awayTeamIdInt }
			]
				.filter(({ choice }) => choice)
				.map(({ choice, teamId }) => ({
					playerId: choice === 'sub' ? null : parseInt(choice!, 10),
					gameId: id,
					teamId
				}));

			// Clear out teams that were swapped out of the game
			await tx
				.delete(goalieGames)
				.where(
					and(
						eq(goalieGames.gameId, id),
						notInArray(goalieGames.teamId, [homeTeamIdInt, awayTeamIdInt])
					)
				);

			if (goalieRows.length) {
				await tx
					.insert(goalieGames)
					.values(goalieRows)
					.onConflictDoUpdate({
						target: [goalieGames.gameId, goalieGames.teamId],
						set: { playerId: sql`excluded.player_id`, updatedAt: new Date() }
					});
			}

			/* Points - only awarded once the game counts */
			await tx.delete(points).where(
				and(
					eq(points.gameId, id),
					// A game that no longer counts loses all its points, otherwise only
					// teams that were swapped out of the game do
					counted ? notInArray(points.teamId, [homeTeamIdInt, awayTeamIdInt]) : undefined
				)
			);

			if (counted) {
				await tx
					.insert(points)
					.values([
						{
							gameId: id,
							teamId: homeTeamIdInt,
							points: POINTS[getResult(homeScore, awayScore)]
						},
						{
							gameId: id,
							teamId: awayTeamIdInt,
							points: POINTS[getResult(awayScore, homeScore)]
						}
					])
					.onConflictDoUpdate({
						target: [points.gameId, points.teamId],
						set: { points: sql`excluded.points` }
					});
			}

			/* Standings - rebuilt from every counted game, so edits never drift.
			 * Includes the teams from before the edit in case they were swapped out. */
			const affected = new Map(
				[
					[existingGame.seasonId, existingGame.homeTeamSeasonId, existingGame.homeTeamId],
					[existingGame.seasonId, existingGame.awayTeamSeasonId, existingGame.awayTeamId],
					[seasonIdInt, homeTeamSeasonId, homeTeamIdInt],
					[seasonIdInt, awayTeamSeasonId, awayTeamIdInt]
				].map(([season, teamSeason, team]) => [teamSeason, { season, teamSeason, team }])
			);

			for (const { season, teamSeason, team } of affected.values()) {
				await recalculateStandings(tx, season, teamSeason, team);
			}
		});

		redirect(303, '/games?updated=true');
	}
);

type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0];

/* Rebuild a team season's standings row from all of its counted games */
const recalculateStandings = async (
	tx: Transaction,
	seasonId: number,
	teamSeasonId: number,
	teamId: number
) => {
	const teamGames = await tx
		.select({
			gameType: games.gameType,
			homeTeamSeasonId: games.homeTeamSeasonId,
			homeScore: games.homeScore,
			awayScore: games.awayScore
		})
		.from(games)
		.where(
			and(
				eq(games.seasonId, seasonId),
				inArray(games.status, COUNTED_STATUSES),
				or(eq(games.homeTeamSeasonId, teamSeasonId), eq(games.awayTeamSeasonId, teamSeasonId))
			)
		);

	const totals = {
		'regular season': {
			gamesPlayed: 0,
			wins: 0,
			ties: 0,
			losses: 0,
			points: 0,
			goalsFor: 0,
			goalsAgainst: 0
		},
		playoff: {
			gamesPlayed: 0,
			wins: 0,
			ties: 0,
			losses: 0,
			points: 0,
			goalsFor: 0,
			goalsAgainst: 0
		}
	};

	for (const game of teamGames) {
		const isHome = game.homeTeamSeasonId === teamSeasonId;
		const goalsFor = isHome ? game.homeScore : game.awayScore;
		const goalsAgainst = isHome ? game.awayScore : game.homeScore;
		const result = getResult(goalsFor, goalsAgainst);
		const total = totals[game.gameType];

		total.gamesPlayed++;
		total.goalsFor += goalsFor;
		total.goalsAgainst += goalsAgainst;
		total.points += POINTS[result];
		if (result === 'win') total.wins++;
		else if (result === 'tie') total.ties++;
		else total.losses++;
	}

	const regular = totals['regular season'];
	const playoff = totals.playoff;

	const values = {
		regularSeasonGamesPlayed: regular.gamesPlayed,
		regularSeasonWins: regular.wins,
		regularSeasonTies: regular.ties,
		regularSeasonLosses: regular.losses,
		regularSeasonPoints: regular.points,
		regularSeasonGoalsFor: regular.goalsFor,
		regularSeasonGoalsAgainst: regular.goalsAgainst,
		playoffGamesPlayed: playoff.gamesPlayed,
		playoffWins: playoff.wins,
		playoffTies: playoff.ties,
		playoffLosses: playoff.losses,
		playoffPoints: playoff.points,
		playoffGoalsFor: playoff.goalsFor,
		playoffGoalsAgainst: playoff.goalsAgainst,
		updatedAt: new Date()
	};

	await tx
		.insert(standings)
		.values({ seasonId, teamSeasonId, teamId, ...values })
		.onConflictDoUpdate({
			target: [standings.seasonId, standings.teamSeasonId],
			set: values
		});
};

/* Get the team season ids */
const getTeamSeasonId = async (teamId: number, seasonId: number) => {
	const [row] = await db
		.select({ id: teamSeasons.id })
		.from(teamSeasons)
		.where(and(eq(teamSeasons.teamId, teamId), eq(teamSeasons.seasonId, seasonId)))
		.limit(1);

	return row?.id;
};
