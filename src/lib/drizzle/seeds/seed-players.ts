/*
 * Seeds 60 players: 52 skaters + 8 goalies (2 per team).
 *
 * NOTE: truncating players cascades to rosters_players, players_stats and
 * goalies_games. Re-run the rosters/games seeds afterwards.
 */
import { players, type NewPlayer } from '../schema';
import { db, truncate, log, runStandalone } from './shared';

const GOALIES: [string, string][] = [
	['Marc-André', 'Tremblay'],
	['Kyle', 'Brannigan'],
	['Devon', 'Whitaker'],
	['Sam', 'Okafor'],
	['Trevor', 'Lindqvist'],
	['Jordan', 'Pelletier'],
	['Rick', 'Havlicek'],
	['Mason', 'Delorme']
];

const SKATERS: [string, string][] = [
	['Liam', 'Carter'],
	['Noah', 'Bouchard'],
	['Ethan', 'Gallagher'],
	['Owen', 'McKinnon'],
	['Jake', 'Sorensen'],
	['Connor', 'Whelan'],
	['Tyler', 'Nakamura'],
	['Brandon', 'Fitzgerald'],
	['Matt', 'Dubois'],
	['Chris', 'Lombardi'],
	['Ryan', "O'Neill"],
	['Josh', 'Kowalski'],
	['Andrew', 'Petrov'],
	['Danny', 'Ferreira'],
	['Mike', 'Sutherland'],
	['Nick', 'Castellano'],
	['Adam', 'Bergeron'],
	['Sean', 'Murphy'],
	['Ben', 'Thibodeau'],
	['Zach', 'Hollis'],
	['Kevin', 'Lachance'],
	['Tom', 'Rasmussen'],
	['Pat', 'Gauthier'],
	['Alex', 'Moreau'],
	['Cody', 'Vanderbeek'],
	['Dylan', 'Scott'],
	['Eric', 'Fontaine'],
	['Greg', 'Molina'],
	['Jeff', 'Blackwood'],
	['Luke', 'Harrington'],
	['Nate', 'Cyr'],
	['Rob', 'Ianello'],
	['Steve', 'Marchand'],
	['Vince', 'Russo'],
	['Will', 'Dempsey'],
	['Aaron', 'Kaplan'],
	['Blake', 'Tessier'],
	['Carl', 'Nyström'],
	['Derek', 'Sawyer'],
	['Evan', 'Roy'],
	['Frank', 'Desjardins'],
	['Graham', 'Ellis'],
	['Henry', 'Boivin'],
	['Ian', 'Fraser'],
	['Jamie', 'Leclerc'],
	['Kurt', 'Weber'],
	['Lucas', 'Beaulieu'],
	['Marco', 'Santini'],
	['Neil', 'Prasad'],
	['Oscar', 'Lindgren'],
	['Paul', 'Kingsley'],
	['Quinn', 'Ashby']
];

/** A few skaters flagged inactive so "active only" filters have something to hide. */
const INACTIVE_LAST_NAMES = new Set(['Hollis', 'Kingsley', 'Ashby']);

export const PLAYERS: NewPlayer[] = [
	...GOALIES.map(([firstName, lastName]) => ({ firstName, lastName, role: 'goalie' as const })),
	...SKATERS.map(([firstName, lastName]) => ({
		firstName,
		lastName,
		role: 'player' as const,
		active: !INACTIVE_LAST_NAMES.has(lastName)
	}))
];

export async function seedPlayers() {
	log('Clearing players (and their roster spots, stats and goalie games)');
	await truncate(players);

	const inserted = await db.insert(players).values(PLAYERS).returning();

	const goalies = inserted.filter((p) => p.role === 'goalie').length;
	log(
		`Inserted ${inserted.length} players (${inserted.length - goalies} skaters, ${goalies} goalies)`
	);
	return inserted;
}

if (import.meta.main) {
	await runStandalone('Seed players', seedPlayers);
}
