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
import { eq, asc, and, getTableColumns } from 'drizzle-orm';
import * as z from 'zod';
import { redirect } from '@sveltejs/kit';
import { error } from '@sveltejs/kit';

export type RosterData = Roster & {
	team: Team;
	season: Season;
};

export interface RosterAndPlayers extends RosterData {
	players: Player[];
}

const CreateRosterSchema = z.object({
	teamId: z.string().min(1, 'Please select a team').nonempty(),
	seasonId: z.string().min(1, 'Please select a season').nonempty(),
	players: z.array(z.string()).optional()
});

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

export const createRoster = form(CreateRosterSchema, async ({ teamId, seasonId, players }) => {
	const teamIdInt = parseInt(teamId, 10);
	const seasonIdInt = parseInt(seasonId, 10);
	const playerIds = players?.length ? players?.map((id) => parseInt(id, 10)) : undefined;

	const [teamSeason] = await db
		.select()
		.from(teamSeasons)
		.where(and(eq(teamSeasons.teamId, teamIdInt), eq(teamSeasons.seasonId, seasonIdInt)));

	if (!teamSeason.id) {
		return error(
			404,
			`Unable to find corresponding team season using season id: ${seasonIdInt} and team id: ${teamIdInt}`
		);
	}

	console.log('in Here!');

	const [rosterResult] = await db
		.insert(rosters)
		.values({
			teamSeasonId: teamSeason.id
		})
		.returning({ insertId: rosters.id });

	if (rosterResult?.insertId && playerIds) {
		await db
			.insert(rostersPlayers)
			.values(playerIds.map((id) => ({ rosterId: rosterResult.insertId, playerId: id })));
	}

	return redirect(301, '/rosters?created=true');
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
