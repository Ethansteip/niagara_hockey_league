/*
 * Seeds a full schedule for every season plus results for games in the past:
 *   - games            round-robin regular season (Sundays, 2 games/night) + playoffs
 *   - players_stats    goals / assists / PIM for every rostered skater in a final game
 *   - goalies_games    which goalie played for each team
 *   - points           team points per game (win 2, tie 1, loss 0)
 *   - standings        recomputed from the seeded results
 *
 * Games dated before "now" are marked final with generated scores; later games
 * stay scheduled. Player/goalie stats are only generated for teams that have a
 * roster in that season, so a season without rosters just gets a schedule.
 *
 * Requires: teams, seasons (team_seasons). Rosters are optional but recommended.
 * NOTE: truncating games cascades to players_stats, goalies_games and points.
 */
import { eq } from 'drizzle-orm';
import {
	games,
	goalieGames,
	players,
	playerStats,
	points,
	rosters,
	rostersPlayers,
	seasons,
	standings,
	teams,
	teamSeasons,
	type NewGame,
	type NewGoalieGame,
	type NewPlayerStat,
	type NewStanding
} from '../schema';
import { db, chunk, createRng, truncate, log, runStandalone, type Rng } from './shared';

const REGULAR_SEASON_WEEKS = 20;
const GAME_TIMES: [number, number][] = [
	[20, 0],
	[21, 15]
];
/** Relative likelihood of a team scoring 0..7 goals in a game. */
const GOAL_WEIGHTS = [4, 10, 16, 18, 14, 9, 5, 2];

type TeamEntry = { teamId: number; teamSeasonId: number; name: string };
type RosterEntry = { skaters: number[]; goalies: number[] };
type Result = { home: number; away: number; decidedIn: 'regulation' | 'overtime' | 'shootout' };
type SeededGame = NewGame & { key: string };
type StatRow = Required<Pick<NewPlayerStat, 'playerId' | 'gameId'>> &
	Record<'goals' | 'assists' | 'penaltyMinutes', number>;

/* ---------- Date helpers ---------- */

function addDays(dateStr: string, days: number) {
	const d = new Date(`${dateStr}T00:00:00Z`);
	d.setUTCDate(d.getUTCDate() + days);
	return d.toISOString().slice(0, 10);
}

function isHolidayWeek(dateStr: string) {
	const [, month, day] = dateStr.split('-').map(Number);
	return (month === 12 && day >= 20) || (month === 1 && day <= 2);
}

/** Eastern time, approximating DST by month (EST Nov-Mar, EDT otherwise). */
function gameTime(dateStr: string, [hour, minute]: [number, number]) {
	const month = Number(dateStr.slice(5, 7));
	const offset = month >= 11 || month <= 3 ? '-05:00' : '-04:00';
	const hh = String(hour).padStart(2, '0');
	const mm = String(minute).padStart(2, '0');
	return new Date(`${dateStr}T${hh}:${mm}:00${offset}`);
}

/** Game-night dates for a season, skipping the holiday break. */
function gameNights(startDate: string, count: number) {
	const nights: string[] = [];
	let date = startDate;
	while (nights.length < count) {
		if (!isHolidayWeek(date)) nights.push(date);
		date = addDays(date, 7);
	}
	return nights;
}

/* ---------- Schedule helpers ---------- */

/** Circle-method round robin: each round has every team playing exactly once. */
function roundRobin<T>(entries: T[]): [T, T][][] {
	const list = [...entries];
	if (list.length % 2 === 1) throw new Error('Round robin needs an even number of teams');
	const rounds: [T, T][][] = [];
	const n = list.length;
	for (let r = 0; r < n - 1; r++) {
		const round: [T, T][] = [];
		for (let i = 0; i < n / 2; i++) {
			const a = list[i];
			const b = list[n - 1 - i];
			// Flip home/away every other round so both sides get home games.
			round.push(r % 2 === 0 ? [a, b] : [b, a]);
		}
		rounds.push(round);
		list.splice(1, 0, list.pop()!);
	}
	return rounds;
}

function generateResult(rng: Rng, playoff: boolean): Result {
	let home = rng.weighted(GOAL_WEIGHTS);
	let away = rng.weighted(GOAL_WEIGHTS);
	if (home !== away) return { home, away, decidedIn: 'regulation' };

	// Tied after regulation. Beer league regular season allows ties; playoffs don't.
	if (!playoff && rng.chance(0.3)) return { home, away, decidedIn: 'regulation' };
	if (rng.chance(0.5)) home += 1;
	else away += 1;
	return { home, away, decidedIn: rng.chance(0.65) ? 'overtime' : 'shootout' };
}

/* ---------- Stats helpers ---------- */

function skaterStats(rng: Rng, skaters: number[], goals: number, gameId: number): StatRow[] {
	const byPlayer = new Map<number, StatRow>(
		skaters.map((playerId) => [
			playerId,
			{ playerId, gameId, goals: 0, assists: 0, penaltyMinutes: 0 }
		])
	);
	if (skaters.length === 0) return [];

	for (let g = 0; g < goals; g++) {
		const scorer = rng.pick(skaters);
		byPlayer.get(scorer)!.goals += 1;

		const assistCount = rng.weighted([2, 4, 4]); // 0, 1 or 2 assists
		const helpers = rng.shuffle(skaters.filter((id) => id !== scorer)).slice(0, assistCount);
		for (const helper of helpers) byPlayer.get(helper)!.assists += 1;
	}

	for (const stat of byPlayer.values()) {
		if (rng.chance(0.03)) stat.penaltyMinutes = 4;
		else if (rng.chance(0.1)) stat.penaltyMinutes = 2;
	}

	return [...byPlayer.values()];
}

type StatKey = `${'regularSeason' | 'playoff'}${
	'GamesPlayed' | 'Wins' | 'Ties' | 'Losses' | 'Points' | 'GoalsFor' | 'GoalsAgainst'}`;
type Standing = NewStanding & Record<StatKey, number>;

function blankStanding(seasonId: number, team: TeamEntry): Standing {
	return {
		seasonId,
		teamSeasonId: team.teamSeasonId,
		teamId: team.teamId,
		regularSeasonGamesPlayed: 0,
		regularSeasonWins: 0,
		regularSeasonTies: 0,
		regularSeasonLosses: 0,
		regularSeasonPoints: 0,
		regularSeasonGoalsFor: 0,
		regularSeasonGoalsAgainst: 0,
		playoffGamesPlayed: 0,
		playoffWins: 0,
		playoffTies: 0,
		playoffLosses: 0,
		playoffPoints: 0,
		playoffGoalsFor: 0,
		playoffGoalsAgainst: 0
	};
}

function applyResult(s: Standing, goalsFor: number, goalsAgainst: number, playoff: boolean) {
	const won = goalsFor > goalsAgainst;
	const tied = goalsFor === goalsAgainst;
	const p = playoff ? 'playoff' : 'regularSeason';
	s[`${p}GamesPlayed`] += 1;
	s[`${p}Wins`] += won ? 1 : 0;
	s[`${p}Ties`] += tied ? 1 : 0;
	s[`${p}Losses`] += !won && !tied ? 1 : 0;
	s[`${p}Points`] += won ? 2 : tied ? 1 : 0;
	s[`${p}GoalsFor`] += goalsFor;
	s[`${p}GoalsAgainst`] += goalsAgainst;
}

function sortByRegularSeason(rows: Standing[]) {
	return [...rows].sort(
		(a, b) =>
			b.regularSeasonPoints - a.regularSeasonPoints ||
			b.regularSeasonWins - a.regularSeasonWins ||
			b.regularSeasonGoalsFor -
				b.regularSeasonGoalsAgainst -
				(a.regularSeasonGoalsFor - a.regularSeasonGoalsAgainst) ||
			b.regularSeasonGoalsFor - a.regularSeasonGoalsFor
	);
}

/* ---------- Main ---------- */

export async function seedGames() {
	const rng = createRng(1967);
	const now = new Date();

	const allSeasons = await db.select().from(seasons).orderBy(seasons.startDate);
	if (allSeasons.length === 0) {
		throw new Error('No seasons found. Run `bun run seed:seasons` first.');
	}

	const allTeamSeasons = await db
		.select({
			teamSeasonId: teamSeasons.id,
			teamId: teams.id,
			seasonId: teamSeasons.seasonId,
			name: teams.name
		})
		.from(teamSeasons)
		.innerJoin(teams, eq(teams.id, teamSeasons.teamId))
		.orderBy(teams.id);

	// teamSeasonId -> rostered skaters / goalies
	const rosterByTeamSeason = new Map<number, RosterEntry>();
	const rosterRows = await db
		.select({ teamSeasonId: rosters.teamSeasonId, playerId: players.id, role: players.role })
		.from(rosters)
		.innerJoin(rostersPlayers, eq(rostersPlayers.rosterId, rosters.id))
		.innerJoin(players, eq(players.id, rostersPlayers.playerId));
	for (const row of rosterRows) {
		const entry = rosterByTeamSeason.get(row.teamSeasonId) ?? { skaters: [], goalies: [] };
		(row.role === 'goalie' ? entry.goalies : entry.skaters).push(row.playerId);
		rosterByTeamSeason.set(row.teamSeasonId, entry);
	}

	log('Clearing games (and player stats, goalie games, points) + standings');
	await truncate(games, standings);

	const allGames: SeededGame[] = [];
	const resultsByKey = new Map<string, Result>();
	const standingRows: Standing[] = [];

	for (const season of allSeasons) {
		const seasonTeams: TeamEntry[] = allTeamSeasons.filter((t) => t.seasonId === season.id);
		if (seasonTeams.length < 2) {
			log(`${season.name}: fewer than 2 teams registered, skipping`);
			continue;
		}

		const standingByTeamSeason = new Map(
			seasonTeams.map((t) => [t.teamSeasonId, blankStanding(season.id, t)])
		);
		const seasonGames: SeededGame[] = [];

		const addGame = (
			home: TeamEntry,
			away: TeamEntry,
			date: string,
			time: [number, number],
			weekNumber: number,
			gameType: NewGame['gameType']
		) => {
			const startDate = gameTime(date, time);
			const key = `${season.id}:${weekNumber}:${home.teamId}-${away.teamId}`;
			const game: SeededGame = {
				key,
				seasonId: season.id,
				homeTeamId: home.teamId,
				awayTeamId: away.teamId,
				homeTeamSeasonId: home.teamSeasonId,
				awayTeamSeasonId: away.teamSeasonId,
				weekNumber,
				startDate,
				gameType,
				status: 'scheduled'
			};

			if (startDate < now) {
				const result = generateResult(rng, gameType === 'playoff');
				resultsByKey.set(key, result);
				Object.assign(game, {
					status: 'final',
					homeScore: result.home,
					awayScore: result.away,
					decidedIn: result.decidedIn
				});
				applyResult(
					standingByTeamSeason.get(home.teamSeasonId)!,
					result.home,
					result.away,
					gameType === 'playoff'
				);
				applyResult(
					standingByTeamSeason.get(away.teamSeasonId)!,
					result.away,
					result.home,
					gameType === 'playoff'
				);
			}

			seasonGames.push(game);
			return game;
		};

		// Regular season: cycle through the round-robin rounds, one round per week.
		const rounds = roundRobin(seasonTeams);
		const nights = gameNights(season.startDate, REGULAR_SEASON_WEEKS + 2);
		for (let week = 0; week < REGULAR_SEASON_WEEKS; week++) {
			const round = rounds[week % rounds.length];
			const flip = Math.floor(week / rounds.length) % 2 === 1;
			round.forEach(([a, b], slot) => {
				const [home, away] = flip ? [b, a] : [a, b];
				addGame(
					home,
					away,
					nights[week],
					GAME_TIMES[slot % GAME_TIMES.length],
					week + 1,
					'regular season'
				);
			});
		}

		// Playoffs (4 teams): only once the regular season is complete.
		const regularSeasonDone = seasonGames.every((g) => g.status === 'final');
		if (regularSeasonDone && seasonTeams.length === 4) {
			const seeded = sortByRegularSeason([...standingByTeamSeason.values()]).map((s) =>
				seasonTeams.find((t) => t.teamSeasonId === s.teamSeasonId)!
			);
			const [seed1, seed2, seed3, seed4] = seeded;
			const semiWeek = REGULAR_SEASON_WEEKS + 1;
			const finalWeek = REGULAR_SEASON_WEEKS + 2;

			const semi1 = addGame(seed1, seed4, nights[semiWeek - 1], GAME_TIMES[0], semiWeek, 'playoff');
			const semi2 = addGame(seed2, seed3, nights[semiWeek - 1], GAME_TIMES[1], semiWeek, 'playoff');

			const winner = (g: SeededGame, home: TeamEntry, away: TeamEntry) =>
				(resultsByKey.get(g.key)?.home ?? 0) > (resultsByKey.get(g.key)?.away ?? 0)
					? [home, away]
					: [away, home];
			const [semi1Winner, semi1Loser] = winner(semi1, seed1, seed4);
			const [semi2Winner, semi2Loser] = winner(semi2, seed2, seed3);

			addGame(semi1Loser, semi2Loser, nights[finalWeek - 1], GAME_TIMES[0], finalWeek, 'playoff');
			addGame(semi1Winner, semi2Winner, nights[finalWeek - 1], GAME_TIMES[1], finalWeek, 'playoff');
		}

		const finals = seasonGames.filter((g) => g.status === 'final').length;
		log(
			`${season.name}: ${seasonGames.length} games (${finals} final, ${seasonGames.length - finals} scheduled)`
		);

		allGames.push(...seasonGames);
		standingRows.push(...standingByTeamSeason.values());
	}

	// Insert games and keep the generated ids.
	const insertedGames: { id: number; key: string }[] = [];
	for (const batch of chunk(allGames)) {
		const rows = await db
			.insert(games)
			.values(batch.map(({ key: _key, ...game }) => game))
			.returning({ id: games.id });
		rows.forEach((row, i) => insertedGames.push({ id: row.id, key: batch[i].key }));
	}
	log(`Inserted ${insertedGames.length} games`);

	// Per-game rows for final games: points for both teams, plus stats where rosters exist.
	const pointRows: (typeof points.$inferInsert)[] = [];
	const statRows: NewPlayerStat[] = [];
	const goalieRows: NewGoalieGame[] = [];

	for (const { id: gameId, key } of insertedGames) {
		const game = allGames.find((g) => g.key === key)!;
		const result = resultsByKey.get(key);
		if (!result) continue;

		const sides = [
			{
				teamId: game.homeTeamId,
				teamSeasonId: game.homeTeamSeasonId,
				goals: result.home,
				against: result.away
			},
			{
				teamId: game.awayTeamId,
				teamSeasonId: game.awayTeamSeasonId,
				goals: result.away,
				against: result.home
			}
		];

		for (const side of sides) {
			const won = side.goals > side.against;
			const tied = side.goals === side.against;
			pointRows.push({ teamId: side.teamId, gameId, points: won ? 2 : tied ? 1 : 0 });

			const roster = rosterByTeamSeason.get(side.teamSeasonId);
			if (!roster) continue;
			statRows.push(...skaterStats(rng, roster.skaters, side.goals, gameId));
			if (roster.goalies.length > 0) {
				goalieRows.push({ playerId: rng.pick(roster.goalies), gameId, teamId: side.teamId });
			}
		}
	}

	for (const batch of chunk(pointRows)) await db.insert(points).values(batch);
	log(`Inserted ${pointRows.length} team point rows`);

	for (const batch of chunk(statRows)) await db.insert(playerStats).values(batch);
	log(`Inserted ${statRows.length} player stat rows`);

	for (const batch of chunk(goalieRows)) await db.insert(goalieGames).values(batch);
	log(`Inserted ${goalieRows.length} goalie game rows`);

	if (standingRows.length > 0) await db.insert(standings).values(standingRows);
	log(`Inserted ${standingRows.length} standings rows`);
}

if (import.meta.main) {
	await runStandalone('Seed games', seedGames);
}
