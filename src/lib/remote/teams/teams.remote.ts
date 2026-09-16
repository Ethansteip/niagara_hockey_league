import { teams, type Team, type NewTeam, seasons, teamSeasons, games } from '$lib/drizzle/schema';
import { query, command, form } from '$app/server';
import { db } from '$lib/drizzle';
import { eq } from 'drizzle-orm';
import * as z from 'zod';
import { redirect } from '@sveltejs/kit';

const TeamFields = z.object({
	teamName: z.string().trim().min(3, 'Team name must be at least 3 characters long.'),
	teamCode: z.string().trim().min(3, 'Team code must be at least 3 characters long.'),
	logoUrl: z.string()
});

const TeamUpdate = TeamFields.extend({
	id: z.int().nonnegative()
});

const TeamDelete = z.object({
	teamId: z.int().nonnegative().nonoptional()
});

/* Get all teams */
export const getTeams = query(async (): Promise<Team[]> => {
	return await db.select().from(teams).orderBy(teams.name);
});

/* Create new team */
export const createTeam = form(TeamFields, async ({ teamName, teamCode, logoUrl }) => {
	const [newTeam] = await db
		.insert(teams)
		.values({ name: teamName, code: teamCode, logoUrl })
		.returning({ insertId: teams.id });

	/* Assign team to active season */
	if (newTeam.insertId) {
		const [activeSeason] = await db
			.select({ seasonId: seasons.id })
			.from(seasons)
			.where(eq(seasons.active, true))
			.limit(1);

		if (activeSeason.seasonId) {
			await db
				.insert(teamSeasons)
				.values({ teamId: newTeam.insertId, seasonId: activeSeason.seasonId });
		}

		redirect(303, '/teams?created=true');
	}
});

/* Edit an existing team */
export const updateTeam = form(TeamUpdate, async ({ id, teamName, teamCode, logoUrl }) => {
	await db.update(teams).set({ name: teamName, code: teamCode, logoUrl }).where(eq(teams.id, id));
	redirect(303, '/teams?updated=true');
});

/* Delete a team */
export const deleteTeam = command(TeamDelete, async ({ teamId }) => {
	await db.delete(teams).where(eq(teams.id, teamId));
});
