/*
 * Seeds the real (unplayed) Tuesday night schedule from
 * src/data/tuesday_hockey_schedule_2026_27.json:
 *   - games        one row per scheduled game, status 'scheduled', scores 0
 *   - standings    reset to zero for every team season (no games have been played)
 *
 * Mapping from the JSON:
 *   - team_a -> home, team_b -> away (the source sheet doesn't mark home/away)
 *   - phase 'regular_season' -> 'regular season', 'playoffs' / 'finals' -> 'playoff'
 *   - date + time are local America/Toronto times
 *   - weekNumber is the game night's position in the schedule (1 = first night,
 *     Sep 22 2026; the Christmas break between Dec 22 and Jan 5 doesn't count)
 *   - each date must fall on its listed day_of_week (all Tuesdays), or the seed fails
 *   - games whose teams are still TBD are skipped, since a game needs both teams
 *
 * Requires: teams, seasons (team_seasons) with a season matching the JSON's season.
 * NOTE: truncating games cascades to players_stats, goalies_games and points.
 */
import { eq } from 'drizzle-orm';
import { games, seasons, standings, teams, teamSeasons, type NewGame } from '../schema';
import { db, chunk, truncate, log, runStandalone } from './shared';
import schedule from '../../../data/tuesday_hockey_schedule_2026_27.json';

type ScheduleGame = (typeof schedule.games)[number];

const GAME_TYPES: Record<string, NewGame['gameType']> = {
	regular_season: 'regular season',
	playoffs: 'playoff',
	finals: 'playoff'
};

/** "2026-27" -> "2026-2027", matching the season names in shared.ts. */
function seasonName(jsonSeason: string) {
	const [start, end] = jsonSeason.split('-');
	return `${start}-${start.slice(0, 2)}${end}`;
}

/** Converts a local wall-clock date + time in the schedule's timezone to an absolute Date. */
function localTime(dateStr: string, time: string, timeZone: string) {
	const guess = new Date(`${dateStr}T${time}:00Z`);
	const offset = new Intl.DateTimeFormat('en-US', { timeZone, timeZoneName: 'longOffset' })
		.formatToParts(guess)
		.find((p) => p.type === 'timeZoneName')!
		.value.replace('GMT', '');
	return new Date(`${dateStr}T${time}:00${offset || 'Z'}`);
}

function weekday(dateStr: string) {
	return new Date(`${dateStr}T12:00:00Z`).toLocaleDateString('en-US', {
		weekday: 'long',
		timeZone: 'UTC'
	});
}

function isTbd(game: ScheduleGame) {
	return game.team_a === 'TBD' || game.team_b === 'TBD';
}

export async function seedGames() {
	const name = seasonName(schedule.season);
	const [season] = await db.select().from(seasons).where(eq(seasons.name, name));
	if (!season) {
		throw new Error(`Season "${name}" not found. Run \`bun run seed:seasons\` first.`);
	}

	const seasonTeams = await db
		.select({ teamSeasonId: teamSeasons.id, teamId: teams.id, name: teams.name })
		.from(teamSeasons)
		.innerJoin(teams, eq(teams.id, teamSeasons.teamId))
		.where(eq(teamSeasons.seasonId, season.id));

	// Schedule uses upper-case names ("LEAFS"), the DB uses "Leafs".
	const teamByName = new Map(seasonTeams.map((t) => [t.name.toUpperCase(), t]));
	const findTeam = (jsonName: string, gameNumber: number) => {
		const team = teamByName.get(jsonName.toUpperCase());
		if (!team) {
			throw new Error(`Game ${gameNumber}: team "${jsonName}" is not registered in ${name}`);
		}
		return team;
	};

	// Week number = position of the game night in the schedule (holiday break doesn't count).
	const nights = [...new Set(schedule.games.map((g) => g.date))].sort();
	const weekByDate = new Map(nights.map((date, i) => [date, i + 1]));

	const rows: NewGame[] = [];
	for (const game of schedule.games) {
		if (isTbd(game)) {
			log(`Skipping game ${game.game_number} (${game.phase}, ${game.date}): teams are TBD`);
			continue;
		}
		if (game.team_a_score !== null || game.team_b_score !== null) {
			throw new Error(`Game ${game.game_number} has a score, but the schedule should be unplayed`);
		}
		if (!game.time) throw new Error(`Game ${game.game_number} has no start time`);
		if (weekday(game.date) !== game.day_of_week) {
			throw new Error(
				`Game ${game.game_number}: ${game.date} is a ${weekday(game.date)}, not a ${game.day_of_week}`
			);
		}

		const gameType = GAME_TYPES[game.phase];
		if (!gameType) throw new Error(`Game ${game.game_number}: unknown phase "${game.phase}"`);

		const home = findTeam(game.team_a, game.game_number);
		const away = findTeam(game.team_b, game.game_number);

		rows.push({
			seasonId: season.id,
			homeTeamId: home.teamId,
			awayTeamId: away.teamId,
			homeTeamSeasonId: home.teamSeasonId,
			awayTeamSeasonId: away.teamSeasonId,
			weekNumber: weekByDate.get(game.date)!,
			startDate: localTime(game.date, game.time, schedule.timezone),
			gameType,
			status: 'scheduled',
			homeScore: 0,
			awayScore: 0
		});
	}

	log('Clearing games (and player stats, goalie games, points) + standings');
	await truncate(games, standings);

	for (const batch of chunk(rows)) await db.insert(games).values(batch);
	const playoffs = rows.filter((g) => g.gameType === 'playoff').length;
	log(
		`${name}: inserted ${rows.length} games (${rows.length - playoffs} regular season, ${playoffs} playoff)`
	);

	// Nothing has been played, so every team season starts with a zeroed standings row.
	const allTeamSeasons = await db.select().from(teamSeasons);
	if (allTeamSeasons.length > 0) {
		await db.insert(standings).values(
			allTeamSeasons.map((ts) => ({
				seasonId: ts.seasonId,
				teamSeasonId: ts.id,
				teamId: ts.teamId
			}))
		);
	}
	log(`Inserted ${allTeamSeasons.length} empty standings rows`);
}

if (import.meta.main) {
	await runStandalone('Seed games', seedGames);
}
