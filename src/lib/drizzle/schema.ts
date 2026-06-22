import {
  pgTable,
  text,
  date,
  integer,
  boolean,
  timestamp,
  pgEnum,
  index,
  uniqueIndex,
  serial,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

/* Enums */
export const gameStatusEnum = pgEnum("game_status_enum", [
  "scheduled",
  "in_progress",
  "final",
  "forfeit",
  "cancelled",
  "postponed",
]);

export const decidedInEnum = pgEnum("decided_in_enum", [
  "regulation",
  "overtime",
  "shootout",
]);

export const playerRoleEnum = pgEnum("player_role_enum", ["player", "goalie"]);

export const gameTypeEnum = pgEnum("game_type_enum", [
  "regular season",
  "playoff",
]);

/* Helpers */
const id = () => serial("id").primaryKey();

const createdAt = () =>
  timestamp("created_at", { withTimezone: true }).notNull().defaultNow();

const updatedAt = () =>
  timestamp("updated_at", { withTimezone: true }).notNull().defaultNow();

/* Players */
export const players = pgTable("players", {
  id: id(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  role: playerRoleEnum("role").notNull().default("player"),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

/* Seasons */
export const seasons = pgTable(
  "seasons",
  {
    id: id(),
    name: text("name").notNull(),
    startDate: date("start_date").notNull(),
    endDate: date("end_date").notNull(),
    active: boolean("active").notNull().default(false),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    {
      uniqueSeasonName: uniqueIndex("unique_season_name").on(t.name),
      uniqueActiveSeason: uniqueIndex("unique_active_season")
        .on(t.active)
        .where(sql`active = true`),
    },
  ],
);

/* Teams */
export const teams = pgTable(
  "teams",
  {
    id: id(),
    name: text("name").notNull(),
    shortName: text("short_name"),
    logoUrl: text("logo_url"),
    code: text("code"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    {
      uniqueTeamName: uniqueIndex("unique_team_name").on(t.name),
    },
  ],
);

/* Team Seasons */
export const teamSeasons = pgTable(
  "team_seasons",
  {
    id: id(),
    teamId: integer("team_id")
      .notNull()
      .references(() => teams.id, { onDelete: "cascade" }),
    seasonId: integer("season_id")
      .notNull()
      .references(() => seasons.id, { onDelete: "cascade" }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    {
      uniqTeamSeason: uniqueIndex("team_seasons_team_season_unique").on(
        t.teamId,
        t.seasonId,
      ),
    },
  ],
);

/*
 * -- Rosters --
 * Used to track players assigned to teams
 * over multiple seasons.
 */
export const rosters = pgTable(
  "rosters",
  {
    id: id(),
    teamSeasonId: integer("team_season_id")
      .notNull()
      .references(() => teamSeasons.id, { onDelete: "cascade" }),
    playerId: integer("player_id")
      .notNull()
      .references(() => players.id, { onDelete: "restrict" }),
    jerseyNumber: integer("jersey_number"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    {
      uniqueRoster: uniqueIndex("rosters_teamseason_player_unique").on(
        t.teamSeasonId,
        t.playerId,
      ),
    },
  ],
);

/* Games */
export const games = pgTable(
  "games",
  {
    id: id(),
    seasonId: integer("season_id")
      .notNull()
      .references(() => seasons.id, { onDelete: "cascade" }),
    homeTeamId: integer("home_team_id")
      .notNull()
      .references(() => teams.id, { onDelete: "cascade" }),
    awayTeamId: integer("away_team_id")
      .notNull()
      .references(() => teams.id, { onDelete: "cascade" }),
    weekNumber: integer("week_number"),
    startDate: timestamp("start_date", { withTimezone: true }).notNull(),
    homeTeamSeasonId: integer("home_team_season_id")
      .notNull()
      .references(() => teamSeasons.id, { onDelete: "restrict" }),
    awayTeamSeasonId: integer("away_team_season_id")
      .notNull()
      .references(() => teamSeasons.id, { onDelete: "restrict" }),
    status: gameStatusEnum("status").notNull().default("scheduled"),
    gameType: gameTypeEnum("game_type").notNull().default("regular season"),
    homeScore: integer("home_score").notNull().default(0),
    awayScore: integer("away_score").notNull().default(0),
    decidedIn: decidedInEnum("decided_in"),
    notes: text("notes"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    {
      idxSchedule: index("games_schedule_idx").on(t.seasonId, t.startDate),
    },
  ],
);

/*
 * -- Goalie Games --
 * Tracks which goalie played in which game.
 * Goals against is derived from games.homeScore / games.awayScore
 * using teamId to determine which side of the ice the goalie played for.
 */
export const goalieGames = pgTable(
  "goalies_games",
  {
    id: id(),
    playerId: integer("player_id")
      .notNull()
      .references(() => players.id, { onDelete: "cascade" }),
    gameId: integer("game_id")
      .notNull()
      .references(() => games.id, { onDelete: "cascade" }),
    teamId: integer("team_id")
      .notNull()
      .references(() => teams.id, { onDelete: "restrict" }),
  },
  (t) => [
    {
      idxGoalieGames: index("goalie_games_idx").on(t.playerId, t.gameId),
      uniqueGoalieGame: uniqueIndex("goalie_games_unique").on(
        t.playerId,
        t.gameId,
      ),
    },
  ],
);

/* Team Standings */
export const standings = pgTable(
  "standings",
  {
    id: id(),
    seasonId: integer("season_id")
      .notNull()
      .references(() => seasons.id, { onDelete: "cascade" }),
    teamSeasonId: integer("team_season_id")
      .notNull()
      .references(() => teamSeasons.id, { onDelete: "cascade" }),
    teamId: integer("team_id")
      .notNull()
      .references(() => teams.id, { onDelete: "cascade" }),
    regularSeasonGamesPlayed: integer("regular_season_games_played")
      .notNull()
      .default(0),
    regularSeasonWins: integer("regular_season_wins").notNull().default(0),
    regularSeasonTies: integer("regular_season_ties").notNull().default(0),
    regularSeasonLosses: integer("regular_season_losses").notNull().default(0),
    regularSeasonPoints: integer("regular_season_points").notNull().default(0),
    regularSeasonGoalsFor: integer("regular_season_goals_for")
      .notNull()
      .default(0),
    regularSeasonGoalsAgainst: integer("regular_season_goals_against")
      .notNull()
      .default(0),
    playoffGamesPlayed: integer("playoff_games_played").notNull().default(0),
    playoffWins: integer("playoff_wins").notNull().default(0),
    playoffTies: integer("playoff_ties").notNull().default(0),
    playoffLosses: integer("playoff_losses").notNull().default(0),
    playoffPoints: integer("playoff_points").notNull().default(0),
    playoffGoalsFor: integer("playoff_goals_for").notNull().default(0),
    playoffGoalsAgainst: integer("playoff_goals_against").notNull().default(0),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    {
      uniqueStanding: uniqueIndex("team_standings_unique").on(
        t.seasonId,
        t.teamSeasonId,
      ),
      idxRegularSeasonPoints: index("regular_season_points_idx").on(
        t.seasonId,
        t.regularSeasonPoints,
      ),
      idxPlayoffPoints: index("playoff_points_idx").on(
        t.seasonId,
        t.playoffPoints,
      ),
    },
  ],
);

/* Player Stats */
export const playerStats = pgTable(
  "players_stats",
  {
    id: id(),
    playerId: integer("player_id")
      .notNull()
      .references(() => players.id, { onDelete: "cascade" }),
    gameId: integer("game_id")
      .notNull()
      .references(() => games.id, { onDelete: "cascade" }),
    goals: integer("goals").notNull().default(0),
    assists: integer("assists").notNull().default(0),
    penaltyMinutes: integer("penalty_minutes").notNull().default(0),
  },
  (t) => [
    {
      uniquePlayerGame: uniqueIndex("player_game_unique").on(
        t.playerId,
        t.gameId,
      ),
      idxPlayerId: index("player_stat_idx").on(t.playerId),
      idxGameId: index("game_stat_idx").on(t.gameId),
    },
  ],
);

/* Types */
export type Player = typeof players.$inferSelect;
export type NewPlayer = typeof players.$inferInsert;
export type Season = typeof seasons.$inferSelect;
export type NewSeason = typeof seasons.$inferInsert;
export type Team = typeof teams.$inferSelect;
export type NewTeam = typeof teams.$inferInsert;
export type TeamSeason = typeof teamSeasons.$inferSelect;
export type NewTeamSeason = typeof teamSeasons.$inferInsert;
export type Roster = typeof rosters.$inferSelect;
export type NewRoster = typeof rosters.$inferInsert;
export type Game = typeof games.$inferSelect;
export type NewGame = typeof games.$inferInsert;
export type Standing = typeof standings.$inferSelect;
export type NewStanding = typeof standings.$inferInsert;
export type GoalieGame = typeof goalieGames.$inferSelect;
export type NewGoalieGame = typeof goalieGames.$inferInsert;
export type PlayerStat = typeof playerStats.$inferSelect;
export type NewPlayerStat = typeof playerStats.$inferInsert;
