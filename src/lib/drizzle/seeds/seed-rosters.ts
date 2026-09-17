/*
 * Seeds one roster per team for the active season, spreading every player
 * across the 4 rosters (2 goalies + 13 skaters each) with unique jersey numbers.
 *
 * Requires: teams, seasons (team_seasons), players.
 * NOTE: truncating rosters cascades to rosters_players.
 */
import { eq } from 'drizzle-orm';
import { players, rosters, rostersPlayers, seasons, teams, teamSeasons } from '../schema';
import { db, ACTIVE_SEASON, createRng, truncate, log, runStandalone } from './shared';

const GOALIE_NUMBERS = [1, 30, 31, 33, 35, 39, 40, 41];
const SKATER_NUMBERS = [
	...Array.from({ length: 28 }, (_, i) => i + 2), // 2-29
	...Array.from({ length: 58 }, (_, i) => i + 42) // 42-99
];

export async function seedRosters() {
	const rng = createRng(2025);

	const [season] = await db.select().from(seasons).where(eq(seasons.name, ACTIVE_SEASON.name));
	if (!season) {
		throw new Error(
			`Season "${ACTIVE_SEASON.name}" not found. Run \`bun run seed:seasons\` first.`
		);
	}

	const seasonTeams = await db
		.select({ teamSeasonId: teamSeasons.id, teamName: teams.name })
		.from(teamSeasons)
		.innerJoin(teams, eq(teams.id, teamSeasons.teamId))
		.where(eq(teamSeasons.seasonId, season.id))
		.orderBy(teams.id);
	if (seasonTeams.length === 0) {
		throw new Error(`No teams registered for ${season.name}. Run \`bun run seed:seasons\` first.`);
	}

	const allPlayers = await db.select().from(players);
	if (allPlayers.length === 0) {
		throw new Error('No players found. Run `bun run seed:players` first.');
	}

	log('Clearing rosters (and roster players)');
	await truncate(rosters);

	const insertedRosters = await db
		.insert(rosters)
		.values(seasonTeams.map((t) => ({ teamSeasonId: t.teamSeasonId })))
		.returning();
	log(`Inserted ${insertedRosters.length} rosters for ${season.name}`);

	// Deal goalies and skaters round-robin so every player lands on exactly one roster.
	const goalies = rng.shuffle(allPlayers.filter((p) => p.role === 'goalie'));
	const skaters = rng.shuffle(allPlayers.filter((p) => p.role !== 'goalie'));

	const rows: (typeof rostersPlayers.$inferInsert)[] = [];
	insertedRosters.forEach((roster, i) => {
		const goalieNumbers = rng.shuffle(GOALIE_NUMBERS);
		const skaterNumbers = rng.shuffle(SKATER_NUMBERS);

		const rosterGoalies = goalies.filter((_, idx) => idx % insertedRosters.length === i);
		const rosterSkaters = skaters.filter((_, idx) => idx % insertedRosters.length === i);

		rosterGoalies.forEach((p, n) =>
			rows.push({ rosterId: roster.id, playerId: p.id, jerseyNumber: goalieNumbers[n] })
		);
		rosterSkaters.forEach((p, n) =>
			rows.push({ rosterId: roster.id, playerId: p.id, jerseyNumber: skaterNumbers[n] })
		);

		const team = seasonTeams.find((t) => t.teamSeasonId === roster.teamSeasonId);
		log(`  ${team?.teamName}: ${rosterSkaters.length} skaters, ${rosterGoalies.length} goalies`);
	});

	await db.insert(rostersPlayers).values(rows);
	log(`Inserted ${rows.length} roster spots`);

	return insertedRosters;
}

if (import.meta.main) {
	await runStandalone('Seed rosters', seedRosters);
}
