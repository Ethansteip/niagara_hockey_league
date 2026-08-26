import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/drizzle';
import { eq } from 'drizzle-orm';
import { seasons } from '$lib/drizzle/schema';

export const load: PageServerLoad = async ({ params }) => {
	const id = parseInt(params.id, 10);

	const [season] = await db.select().from(seasons).where(eq(seasons.id, id));

	if (!season) {
		error(404, 'Season not found');
	}

	return {
		season
	};
};
