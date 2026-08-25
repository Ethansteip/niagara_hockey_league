import { query, form, command } from '$app/server';
import { db } from '$lib/drizzle';
import { seasons } from '$lib/drizzle/schema';
import { desc, eq, type InferSelectModel } from 'drizzle-orm';
import * as z from 'zod';
import { redirect } from '@sveltejs/kit';

export type Season = InferSelectModel<typeof seasons>;

const SeasonCreate = z
	.object({
		seasonName: z.string().trim().min(1, 'Season name is required'),
		startDate: z.iso.date('Select a start date'),
		endDate: z.iso.date('Select an end date'),
		isActive: z.boolean().default(false)
	})
	.refine((season) => season.endDate > season.startDate, {
		path: ['endDate'],
		error: 'End date must be after the start date'
	});

const SeasonDelete = z.object({
	seasonId: z.int().nonnegative().nonoptional()
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

		await db.insert(seasons).values({ name: seasonName, startDate, endDate, active: isActive });
		redirect(303, '/seasons?created=true');
	}
);

/* Delete a season */
export const deleteSeason = command(SeasonDelete, async ({ seasonId }) => {
	await db.delete(seasons).where(eq(seasons.id, seasonId));
});
