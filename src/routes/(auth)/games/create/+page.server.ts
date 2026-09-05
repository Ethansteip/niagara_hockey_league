import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getSeasons } from '../../seasons/seasons.remote';
import type { Team, Season } from '$lib/drizzle/schema';
import { getTeams } from '../../teams/teams.remote';

export const load: PageServerLoad = async ({ params }) => {
	const seasons: Season[] = await getSeasons();
	const teams: Team[] = await getTeams();

	return {
		seasons,
		teams
	};
};
