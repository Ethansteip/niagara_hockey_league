import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/drizzle';
import { eq } from 'drizzle-orm';
import { teams } from '$lib/drizzle/schema';

export const load: PageServerLoad = async ({ params }) => {
	const id = parseInt(params.id, 10);

	console.log('Id: ', id);

	const [team] = await db.select().from(teams).where(eq(teams.id, id));

	if (!team) {
		error(404, 'Team not found');
	}

	console.log('Team: ', team);

	return {
		team
	};
};
