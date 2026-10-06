/*
 * Seeds the 60 league players from src/data/players_202606131025.csv.
 * Everyone starts as a skater ('player'); flag the goalies by hand afterwards.
 *
 * NOTE: truncating players cascades to rosters_players, players_stats and
 * goalies_games. Re-run the rosters/games seeds afterwards.
 */
import { players, type NewPlayer } from '../schema';
import { db, truncate, log, runStandalone } from './shared';

const NAMES: [string, string][] = [
	['Gary', 'Friesen'],
	['Jeff', 'Peckham'],
	['Steve', 'Peckham'],
	['Mike', 'Cw'],
	['Zenon', 'Konopka'],
	['Matt', 'Friesen'],
	['Ryan', 'Fowler'],
	['Jay', 'Reynolds'],
	['Matt', 'Mines'],
	['Eric', 'Teichgraf'],
	['Kevin', 'Disher'],
	['Travis', 'Saunders'],
	['Mark', 'Lepp'],
	['Corey', 'Fowler'],
	['Corey', 'Motley'],
	['Brian', 'Neufeld'],
	['Devin', 'Sartor'],
	['John', 'Vanderhoeven'],
	['Garrett', 'Kazycki'],
	['Josh', 'Petrokowski'],
	['Greg', 'Litke'],
	['Kevin', 'Coffey'],
	['Thomas', 'Baker'],
	['Mikey', 'Werner'],
	['Neil', 'Wachs'],
	['Corey', 'Paul'],
	['Brad', 'Neudorf'],
	['Travis', 'Kazycki'],
	['Jay', 'Disher'],
	['Ryan', 'Wagner'],
	['Reid', 'Watson'],
	['Cody', 'Wall'],
	['Joe', 'Vanegmond'],
	['Kyle', 'Greenside'],
	['Shane', 'Wall'],
	['Shawn', 'Merza'],
	['Malcolm', 'Vanderzalm'],
	['Brandon', 'Andres'],
	['Dale', 'Landry'],
	['Jarrod', 'Warren'],
	['Eric', 'Vanderzalm'],
	['Quinton', 'Spagnol'],
	['Josh', 'Wicharyic'],
	['Dave', 'Dehaan'],
	['Layne', 'Gobeil'],
	['Derek', 'Merza'],
	['Jared', 'Hope'],
	['Paul', 'Disher'],
	['Mike', 'Hicks'],
	['Adam', 'Epp'],
	['Trevor', 'Vanderzalm'],
	['Dan', 'Willms'],
	['Ethan', 'Steip'],
	['Scott', 'Falk'],
	['Brad', 'Burns'],
	['Brendan', 'Misener'],
	['Jay', 'Haubrok'],
	['Jeff', 'Sinclair'],
	['Jeff', 'Martens'],
	['Dan', 'Tiessen']
];

export const PLAYERS: NewPlayer[] = NAMES.map(([firstName, lastName]) => ({
	firstName,
	lastName,
	role: 'player' as const
}));

export async function seedPlayers() {
	log('Clearing players (and their roster spots, stats and goalie games)');
	await truncate(players);

	const inserted = await db.insert(players).values(PLAYERS).returning();

	log(`Inserted ${inserted.length} players`);
	return inserted;
}

if (import.meta.main) {
	await runStandalone('Seed players', seedPlayers);
}
