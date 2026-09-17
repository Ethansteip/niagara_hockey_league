/*
 * Master seed: runs every seed script in dependency order.
 *   bun run seed
 */
import { seedTeams } from './seed-teams';
import { seedSeasons } from './seed-seasons';
import { seedPlayers } from './seed-players';
import { seedRosters } from './seed-rosters';
import { seedGames } from './seed-games';
import { runStandalone } from './shared';

await runStandalone('Seed all', async () => {
	await seedTeams();
	await seedSeasons();
	await seedPlayers();
	await seedRosters();
	await seedGames();
});
