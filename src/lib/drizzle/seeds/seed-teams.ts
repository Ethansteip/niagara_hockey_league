/*
 * Seeds the 4 league teams.
 *
 * NOTE: truncating teams cascades to team_seasons, rosters, games, standings,
 * points and goalies_games. Re-run the seasons/rosters/games seeds afterwards
 * (or just `bun run seed`).
 */
import { teams } from '../schema';
import { db, TEAMS, truncate, log, runStandalone } from './shared';

export async function seedTeams() {
	log('Clearing teams (and everything that depends on them)');
	await truncate(teams);

	const inserted = await db
		.insert(teams)
		.values(TEAMS.map((t) => ({ name: t.name, code: t.code })))
		.returning();

	log(`Inserted ${inserted.length} teams: ${inserted.map((t) => t.name).join(', ')}`);
	return inserted;
}

if (import.meta.main) {
	await runStandalone('Seed teams', seedTeams);
}
