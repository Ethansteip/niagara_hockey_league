import type { PageServerLoad } from './$types';
import { getSeasons } from '$lib/remote/seasons/seasons.remote';
import type { Team, Season } from '$lib/drizzle/schema';
import { getTeams } from '$lib/remote/teams/teams.remote';

export const load: PageServerLoad = async ({ params }) => {
	const seasons: Season[] = await getSeasons();
	const teams: Team[] = await getTeams();

	return {
		seasons,
		teams
	};
};
