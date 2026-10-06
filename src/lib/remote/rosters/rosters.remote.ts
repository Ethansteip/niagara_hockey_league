import { query, form, command } from '$app/server';
import { db } from '$lib/drizzle';
import {
	rosters,
	rostersPlayers,
	seasons,
	teams,
	players,
	teamSeasons,
	type Season,
	type Team,
	type Roster,
	type Player
} from '$lib/drizzle/schema';
import { eq, asc, desc, and, notInArray, getTableColumns, sql } from 'drizzle-orm';
import * as z from 'zod';
import { redirect, invalid } from '@sveltejs/kit';
import { error } from '@sveltejs/kit';

export type RosterData = Roster & {
	team: Team;
	season: Season;
};

export type RosterPlayer = Player & {
	jerseyNumber: number | null;
};

export interface RosterAndPlayers extends RosterData {
	players: RosterPlayer[];
}

/* A player on the roster, with their jersey number for this team season */
const RosterPlayerSchema = z.object({
	playerId: z.int().nonnegative(),
	jerseyNumber: z
		.int('Jersey numbers must be a whole number')
		.min(0, 'Jersey numbers must be between 0 and 99')
		.max(99, 'Jersey numbers must be between 0 and 99')
		.optional()
});

const RosterPlayersSchema = z
	.array(RosterPlayerSchema)
	.optional()
	.refine(
		(players) => {
			const numbers = players?.flatMap((p) => p.jerseyNumber ?? []) ?? [];
			return new Set(numbers).size === numbers.length;
		},
		{ message: 'Two players on the same roster cant wear the same number' }
	);

/* One row per player (the last one wins), ready to insert */
const toRosterRows = (rosterId: number, players: z.infer<typeof RosterPlayersSchema>) => [
	...new Map(
		players?.map(({ playerId, jerseyNumber }) => [
			playerId,
			{ rosterId, playerId, jerseyNumber: jerseyNumber ?? null }
		])
	).values()
];

const CreateRosterSchema = z.object({
	teamId: z.string().min(1, 'Please select a team').nonempty(),
	seasonId: z.string().min(1, 'Please select a season').nonempty(),
	players: RosterPlayersSchema
});

export const getRoster = query(
	z.object({ id: z.int().nonoptional() }),
	async ({ id }): Promise<RosterAndPlayers> => {
		const [roster] = await db
			.select({
				...getTableColumns(rosters),
				team: { ...getTableColumns(teams) },
				season: { ...getTableColumns(seasons) }
			})
			.from(rosters)
			.innerJoin(teamSeasons, eq(teamSeasons.id, rosters.teamSeasonId))
			.innerJoin(teams, eq(teamSeasons.teamId, teams.id))
			.innerJoin(seasons, eq(teamSeasons.seasonId, seasons.id))
			.where(eq(rosters.id, id))
			.limit(1);

		if (!roster) {
			error(404, `Roster with id ${id} not found`);
		}

		const rosterPlayers = await db
			.select({
				...getTableColumns(players),
				jerseyNumber: rostersPlayers.jerseyNumber
			})
			.from(rostersPlayers)
			.innerJoin(players, eq(rostersPlayers.playerId, players.id))
			.where(eq(rostersPlayers.rosterId, id))
			.orderBy(asc(players.lastName), asc(players.firstName));

		return { ...roster, players: rosterPlayers };
	}
);

/* Players on a team's roster for a season - goalies first, then by jersey number */
export const getTeamSeasonRoster = query(
	z.object({
		teamId: z.int().nonnegative().nonoptional(),
		seasonId: z.int().nonnegative().nonoptional()
	}),
	async ({ teamId, seasonId }): Promise<RosterPlayer[]> => {
		return await db
			.select({
				...getTableColumns(players),
				jerseyNumber: rostersPlayers.jerseyNumber
			})
			.from(rostersPlayers)
			.innerJoin(players, eq(rostersPlayers.playerId, players.id))
			.innerJoin(rosters, eq(rosters.id, rostersPlayers.rosterId))
			.innerJoin(teamSeasons, eq(teamSeasons.id, rosters.teamSeasonId))
			.where(and(eq(teamSeasons.teamId, teamId), eq(teamSeasons.seasonId, seasonId)))
			.orderBy(
				desc(players.role),
				asc(rostersPlayers.jerseyNumber),
				asc(players.lastName),
				asc(players.firstName)
			);
	}
);

export const getRosters = query(async (): Promise<RosterData[]> => {
	return await db
		.select({
			...getTableColumns(rosters),
			team: { ...getTableColumns(teams) },
			season: { ...getTableColumns(seasons) }
		})
		.from(rosters)
		.innerJoin(teamSeasons, eq(teamSeasons.id, rosters.teamSeasonId))
		.innerJoin(seasons, eq(seasons.id, teamSeasons.seasonId))
		.innerJoin(teams, eq(teams.id, teamSeasons.teamId))
		.orderBy(asc(rosters.id));
});

export const createRoster = form(
	CreateRosterSchema,
	async ({ teamId, seasonId, players }, issue) => {
		const teamIdInt = parseInt(teamId, 10);
		const seasonIdInt = parseInt(seasonId, 10);
		const [teamSeason] = await db
			.select({ id: teamSeasons.id })
			.from(teamSeasons)
			.where(and(eq(teamSeasons.teamId, teamIdInt), eq(teamSeasons.seasonId, seasonIdInt)))
			.limit(1);

		if (!teamSeason) {
			invalid(issue.teamId('This team is not part of the selected season'));
		}

		const [existingRoster] = await db
			.select({ id: rosters.id })
			.from(rosters)
			.where(eq(rosters.teamSeasonId, teamSeason.id))
			.limit(1);

		if (existingRoster) {
			invalid(issue.teamId('This team already has a roster for the selected season'));
		}

		await db.transaction(async (tx) => {
			const [roster] = await tx
				.insert(rosters)
				.values({ teamSeasonId: teamSeason.id })
				.returning({ id: rosters.id });

			const rows = toRosterRows(roster.id, players);

			if (rows.length) {
				await tx.insert(rostersPlayers).values(rows);
			}
		});

		redirect(303, '/rosters?created=true');
	}
);

const UpdateRosterSchema = z.object({
	// Injected by `updateRoster.for(id)`
	id: z.int().nonnegative().optional(),
	players: RosterPlayersSchema
});

/* Update the players on a roster and their jersey numbers */
export const updateRoster = form(UpdateRosterSchema, async ({ id, players }) => {
	if (!id) {
		error(400, 'Roster id is required');
	}

	const [roster] = await db
		.select({ id: rosters.id })
		.from(rosters)
		.where(eq(rosters.id, id))
		.limit(1);

	if (!roster) {
		error(404, `Roster with id ${id} not found`);
	}

	const rows = toRosterRows(id, players);
	const playerIds = rows.map((row) => row.playerId);

	await db.transaction(async (tx) => {
		// Remove everyone who's no longer selected
		await tx
			.delete(rostersPlayers)
			.where(
				and(
					eq(rostersPlayers.rosterId, id),
					playerIds.length ? notInArray(rostersPlayers.playerId, playerIds) : undefined
				)
			);

		// Add new players, and update the jersey number of anyone already on the roster
		if (rows.length) {
			await tx
				.insert(rostersPlayers)
				.values(rows)
				.onConflictDoUpdate({
					target: [rostersPlayers.rosterId, rostersPlayers.playerId],
					set: { jerseyNumber: sql`excluded.jersey_number`, updatedAt: new Date() }
				});
		}
	});

	redirect(303, '/rosters?updated=true');
});

export const deleteRoster = command(
	z.object({ rosterId: z.int().nonoptional() }),
	async ({ rosterId }) => {
		if (!rosterId) {
			return error(400, 'Missing roster id on delete request');
		}

		return await db.delete(rosters).where(eq(rosters.id, rosterId));
	}
);
