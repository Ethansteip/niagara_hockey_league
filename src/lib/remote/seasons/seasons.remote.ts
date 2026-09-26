import { query, form, command } from '$app/server';
import { db } from '$lib/drizzle';
import { games, seasons, teams, teamSeasons, type Team } from '$lib/drizzle/schema';
import { desc, eq, max, type InferSelectModel } from 'drizzle-orm';
import * as z from 'zod';
import { redirect } from '@sveltejs/kit';

export type Season = InferSelectModel<typeof seasons>;

const SeasonFields = z.object({
	seasonName: z.string().trim().min(1, 'Season name is required'),
	startDate: z.iso.date('Select a start date'),
	endDate: z.iso.date('Select an end date'),
	isActive: z.boolean().default(false)
});

const endAfterStart = {
	path: ['endDate'],
	error: 'End date must be after the start date'
};

const SeasonCreate = SeasonFields.refine(
	(season) => season.endDate > season.startDate,
	endAfterStart
);

const SeasonUpdate = SeasonFields.extend({
	id: z.int().nonnegative()
}).refine((season) => season.endDate > season.startDate, endAfterStart);

const SeasonDelete = z.object({
	seasonId: z.int().nonnegative().nonoptional()
});

export type ActiveSeasonSummary = {
	name: string;
	/* Highest week number on the schedule, or null before any games are scheduled */
	totalWeeks: number | null;
};

/* Get the active season's name and length in weeks */
export const getActiveSeasonSummary = query(async (): Promise<ActiveSeasonSummary | null> => {
	const [summary] = await db
		.select({ name: seasons.name, totalWeeks: max(games.weekNumber) })
		.from(seasons)
		.leftJoin(games, eq(games.seasonId, seasons.id))
		.where(eq(seasons.active, true))
		.groupBy(seasons.id);

	return summary ?? null;
});

/* Get all seasons - sorted by season start date */
export const getSeasons = query(async (): Promise<Season[]> => {
	return db.select().from(seasons).orderBy(desc(seasons.startDate));
});

/* Create new season */
export const createSeason = form(
	SeasonCreate,
	async ({ seasonName, startDate, endDate, isActive }) => {
		if (isActive) {
			// Disable the current active season.
			await db.update(seasons).set({ active: false }).where(eq(seasons.active, true));
		}

		const [season] = await db
			.insert(seasons)
			.values({ name: seasonName, startDate, endDate, active: isActive })
			.returning({ insertId: seasons.id });

		/* Create team_season records */
		if (season.insertId) {
			const teamsResult: Team[] = await db.select().from(teams);

			await db.insert(teamSeasons).values(
				teamsResult.map((team) => {
					return { teamId: team.id, seasonId: season.insertId };
				})
			);
		}

		redirect(303, '/seasons?created=true');
	}
);

/* Update an existing season */
export const updateSeason = form(
	SeasonUpdate,
	async ({ id, seasonName, startDate, endDate, isActive }) => {
		if (isActive) {
			// Disable the current active season.
			await db.update(seasons).set({ active: false }).where(eq(seasons.active, true));
		}

		await db
			.update(seasons)
			.set({ name: seasonName, startDate, endDate, active: isActive, updatedAt: new Date() })
			.where(eq(seasons.id, id));
		redirect(303, '/seasons?updated=true');
	}
);

/* Delete a season */
export const deleteSeason = command(SeasonDelete, async ({ seasonId }) => {
	await db.delete(seasons).where(eq(seasons.id, seasonId));
});
