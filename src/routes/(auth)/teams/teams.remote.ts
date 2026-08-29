import { teams, type Team, type NewTeam, seasons, teamSeasons } from '$lib/drizzle/schema';
import { query, command, form } from '$app/server';
import { db } from '$lib/drizzle';
import { eq } from 'drizzle-orm';
import * as z from 'zod';
import { redirect } from '@sveltejs/kit';

const TeamFields = z.object({
	teamName: z.string().trim().min(3, 'Team name is required'),
	teamCode: z.string().trim().min(3, 'Team code is required'),
	logoUrl: z.string()
});

const TeamDelete = z.object({
	teamId: z.int().nonnegative().nonoptional()
});

/* Get all teams */
export const getTeams = query(async (): Promise<Team[]> => {
	return db.select().from(teams).orderBy(teams.name);
});

/* Create new team */
export const createTeam = form(TeamFields, async ({ teamName, teamCode, logoUrl }) => {
	const [newTeam] = await db
		.insert(teams)
		.values({ name: teamName, code: teamCode, logoUrl })
		.returning({ insertId: teams.id });

	/* Assign team-season */
	if (newTeam.insertId) {
		const [activeSeason] = await db
			.select({ seasonId: seasons.id })
			.from(seasons)
			.where(eq(seasons.active, true))
			.limit(1);

		await db
			.insert(teamSeasons)
			.values({ teamId: newTeam.insertId, seasonId: activeSeason.seasonId });

		redirect(303, '/teams?created=true');
	}
});

/* Delete a team */
export const deleteTeam = command(TeamDelete, async ({ teamId }) => {
	await db.delete(teams).where(eq(teams.id, teamId));
});
