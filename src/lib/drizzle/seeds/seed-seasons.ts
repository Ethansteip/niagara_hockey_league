/*
 * Seeds the 2 seasons, registers every team in every season (team_seasons),
 * and creates a zeroed standings row per team season.
 *
 * Requires: teams.
 * NOTE: truncating seasons cascades to team_seasons, rosters, games, standings
 * and everything hanging off games. Re-run rosters/games afterwards.
 */
import { seasons, standings, teams, teamSeasons } from '../schema';
import { db, SEASONS, truncate, log, runStandalone } from './shared';

export async function seedSeasons() {
	const allTeams = await db.select().from(teams);
	if (allTeams.length === 0) {
		throw new Error('No teams found. Run `bun run seed:teams` first.');
	}

	log('Clearing seasons (and everything that depends on them)');
	await truncate(seasons);

	const insertedSeasons = await db
		.insert(seasons)
		.values(SEASONS.map((s) => ({ ...s })))
		.returning();
	log(
		`Inserted ${insertedSeasons.length} seasons: ${insertedSeasons
			.map((s) => `${s.name}${s.active ? ' (active)' : ''}`)
			.join(', ')}`
	);

	// Every team plays in every season.
	const insertedTeamSeasons = await db
		.insert(teamSeasons)
		.values(
			insertedSeasons.flatMap((season) =>
				allTeams.map((team) => ({ teamId: team.id, seasonId: season.id }))
			)
		)
		.returning();
	log(`Inserted ${insertedTeamSeasons.length} team seasons`);

	// Empty standings rows so the standings page has something to show before games exist.
	const insertedStandings = await db
		.insert(standings)
		.values(
			insertedTeamSeasons.map((ts) => ({
				seasonId: ts.seasonId,
				teamSeasonId: ts.id,
				teamId: ts.teamId
			}))
		)
		.returning();
	log(`Inserted ${insertedStandings.length} empty standings rows`);

	return { seasons: insertedSeasons, teamSeasons: insertedTeamSeasons };
}

if (import.meta.main) {
	await runStandalone('Seed seasons', seedSeasons);
}
