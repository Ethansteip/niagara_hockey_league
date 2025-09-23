// drizzle-schema.ts
// Drizzle ORM schema for a simplified men's hockey league app on Supabase/Postgres
// Matches the latest SQL you approved: leagues/seasons/divisions/teams/team_seasons,
// arenas, players, rosters, games, skater_game_stats, goalie_game_stats, team_standings.

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
import { relations } from "drizzle-orm";

// =====================
// ENUMS
// =====================
export const positionEnum = pgEnum("position_enum", [
  "G",
  "D",
  "LW",
  "C",
  "RW",
]);
export const shotHandEnum = pgEnum("shot_hand_enum", ["L", "R"]);
export const gameStatusEnum = pgEnum("game_status_enum", [
  "scheduled",
  "in_progress",
  "final",
  "forfeit",
  "cancelled",
  "postponed",
]);
export const rosterRoleEnum = pgEnum("roster_role_enum", ["player", "goalie"]);
export const decidedInEnum = pgEnum("decided_in_enum", [
  "regulation",
  "overtime",
  "shootout",
]);

// Helpers
const id = () => serial("id").primaryKey();
const createdAt = () =>
  timestamp("created_at", { withTimezone: true }).notNull().defaultNow();

// =====================
// CORE ENTITIES
// =====================
export const leagues = pgTable("leagues", {
  id: id(),
  name: text("name").notNull(),
  createdAt: createdAt(),
});

export const seasons = pgTable(
  "seasons",
  {
    id: id(),
    leagueId: integer("league_id")
      .notNull()
      .references(() => leagues.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    startsOn: date("starts_on").notNull(),
    endsOn: date("ends_on").notNull(),
    createdAt: createdAt(),
  },
  (t) => [
    {
      uniqLeagueName: uniqueIndex("seasons_league_name_uniq").on(
        t.leagueId,
        t.name
      ),
    },
  ]
);

export const divisions = pgTable(
  "divisions",
  {
    id: id(),
    seasonId: integer("season_id")
      .notNull()
      .references(() => seasons.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    createdAt: createdAt(),
  },
  (t) => [
    {
      uniqSeasonName: uniqueIndex("divisions_season_name_uniq").on(
        t.seasonId,
        t.name
      ),
    },
  ]
);

export const teams = pgTable(
  "teams",
  {
    id: id(),
    leagueId: integer("league_id")
      .notNull()
      .references(() => leagues.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    shortName: text("short_name"),
    logoUrl: text("logo_url"),
    createdAt: createdAt(),
  },
  (t) => [
    {
      uniqLeagueName: uniqueIndex("teams_league_name_uniq").on(
        t.leagueId,
        t.name
      ),
    },
  ]
);

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
    divisionId: integer("division_id")
      .notNull()
      .references(() => divisions.id, { onDelete: "cascade" }),
    createdAt: createdAt(),
  },
  (t) => [
    {
      uniqTeamSeason: uniqueIndex("team_seasons_team_season_uniq").on(
        t.teamId,
        t.seasonId
      ),
    },
  ]
);

export const arenas = pgTable("arenas", {
  id: id(),
  name: text("name").notNull(),
  address: text("address"),
  city: text("city"),
  province: text("province"),
  createdAt: createdAt(),
});

export const players = pgTable(
  "players",
  {
    id: id(),
    firstName: text("first_name").notNull(),
    lastName: text("last_name").notNull(),
    preferredName: text("preferred_name"),
    email: text("email"),
    phone: text("phone"),
    birthdate: date("birthdate"),
    position: positionEnum("position"),
    shoots: shotHandEnum("shoots"),
    createdAt: createdAt(),
  },
  (t) => [
    {
      uniqEmail: uniqueIndex("players_email_uniq").on(t.email),
    },
  ]
);

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
    role: rosterRoleEnum("role").notNull().default("player"),
    isCaptain: boolean("is_captain").notNull().default(false),
    isAlternate: boolean("is_alternate").notNull().default(false),
    createdAt: createdAt(),
  },
  (t) => [
    {
      uniqRoster: uniqueIndex("rosters_teamseason_player_uniq").on(
        t.teamSeasonId,
        t.playerId
      ),
      idxTeamSeasonPlayer: index("rosters_teamseason_player_idx").on(
        t.teamSeasonId,
        t.playerId
      ),
    },
  ]
);

// =====================
// GAMES / SCHEDULING
// =====================
export const games = pgTable(
  "games",
  {
    id: id(),
    seasonId: integer("season_id")
      .notNull()
      .references(() => seasons.id, { onDelete: "cascade" }),
    divisionId: integer("division_id")
      .notNull()
      .references(() => divisions.id, { onDelete: "cascade" }),
    homeTeamId: integer("home_team_id")
      .notNull()
      .default(1)
      .references(() => teams.id, { onDelete: "cascade" }),
    awayTeamId: integer("away_team_id")
      .notNull()
      .default(1)
      .references(() => teams.id, { onDelete: "cascade" }),
    weekNumber: integer("week_number"),
    startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
    arenaId: integer("arena_id").references(() => arenas.id, {
      onDelete: "set null",
    }),
    homeTeamSeasonId: integer("home_team_season_id")
      .notNull()
      .references(() => teamSeasons.id, { onDelete: "restrict" }),
    awayTeamSeasonId: integer("away_team_season_id")
      .notNull()
      .references(() => teamSeasons.id, { onDelete: "restrict" }),
    status: gameStatusEnum("status").notNull().default("scheduled"),
    homeScore: integer("home_score").notNull().default(0),
    awayScore: integer("away_score").notNull().default(0),
    decidedIn: decidedInEnum("decided_in"),
    notes: text("notes"),
    createdAt: createdAt(),
  },
  (t) => [
    {
      idxSchedule: index("games_schedule_idx").on(
        t.seasonId,
        t.divisionId,
        t.startsAt
      ),
    },
  ]
);

// =====================
// STATS (split tables)
// =====================
export const playerGameStats = pgTable(
  "player_game_stats",
  {
    id: id(),
    gameId: integer("game_id")
      .notNull()
      .references(() => games.id, { onDelete: "cascade" }),
    seasonId: integer("season_id")
      .notNull()
      .references(() => seasons.id, { onDelete: "cascade" }),
    teamSeasonId: integer("team_season_id")
      .notNull()
      .references(() => teamSeasons.id, { onDelete: "cascade" }),
    rosterId: integer("roster_id")
      .notNull()
      .references(() => rosters.id, { onDelete: "restrict" }),
    goals: integer("goals").notNull().default(0),
    assists: integer("assists").notNull().default(0),
    shots: integer("shots").notNull().default(0),
    pim: integer("pim").notNull().default(0),
    isDressed: boolean("is_dressed").notNull().default(true),
    isStarter: boolean("is_starter").notNull().default(false),
    createdAt: createdAt(),
  },
  (t) => [
    {
      uniqGameRoster: uniqueIndex("player_stats_game_roster_uniq").on(
        t.gameId,
        t.rosterId
      ),
      idxSeason: index("player_stats_season_idx").on(t.seasonId),
      idxTeamSeason: index("player_stats_teamseason_idx").on(t.teamSeasonId),
    },
  ]
);

export const goalieGameStats = pgTable(
  "goalie_game_stats",
  {
    id: id(),
    gameId: integer("game_id")
      .notNull()
      .references(() => games.id, { onDelete: "cascade" }),
    seasonId: integer("season_id")
      .notNull()
      .references(() => seasons.id, { onDelete: "cascade" }),
    teamSeasonId: integer("team_season_id")
      .notNull()
      .references(() => teamSeasons.id, { onDelete: "cascade" }),
    rosterId: integer("roster_id")
      .notNull()
      .references(() => rosters.id, { onDelete: "restrict" }),
    saves: integer("saves").notNull().default(0),
    shotsAgainst: integer("shots_against").notNull().default(0),
    goalsAgainst: integer("goals_against").notNull().default(0),
    minutesPlayed: integer("minutes_played").notNull().default(0),
    isDressed: boolean("is_dressed").notNull().default(true),
    isStarter: boolean("is_starter").notNull().default(false),
    createdAt: createdAt(),
  },
  (t) => [
    {
      uniqGameRoster: uniqueIndex("goalie_stats_game_roster_uniq").on(
        t.gameId,
        t.rosterId
      ),
      idxSeason: index("goalie_stats_season_idx").on(t.seasonId),
      idxTeamSeason: index("goalie_stats_teamseason_idx").on(t.teamSeasonId),
    },
  ]
);

// =====================
// STANDINGS
// =====================
export const teamStandings = pgTable(
  "team_standings",
  {
    id: id(),
    seasonId: integer("season_id")
      .notNull()
      .references(() => seasons.id, { onDelete: "cascade" }),
    divisionId: integer("division_id")
      .notNull()
      .references(() => divisions.id, { onDelete: "cascade" }),
    teamSeasonId: integer("team_season_id")
      .notNull()
      .references(() => teamSeasons.id, { onDelete: "cascade" }),
    gp: integer("gp").notNull().default(0),
    w: integer("w").notNull().default(0),
    l: integer("l").notNull().default(0),
    otl: integer("otl").notNull().default(0),
    points: integer("points").notNull().default(0),
    gf: integer("gf").notNull().default(0),
    ga: integer("ga").notNull().default(0),
    createdAt: createdAt(),
  },
  (t) => [
    {
      uniqStanding: uniqueIndex("team_standings_uniq").on(
        t.seasonId,
        t.divisionId,
        t.teamSeasonId
      ),
      idxTable: index("team_standings_table_idx").on(
        t.seasonId,
        t.divisionId,
        t.points
      ),
    },
  ]
);

// =====================
// RELATIONS (optional but handy for joins & type inference)
// =====================
export const leaguesRelations = relations(leagues, ({ many }) => ({
  seasons: many(seasons),
  teams: many(teams),
}));

export const seasonsRelations = relations(seasons, ({ one, many }) => ({
  league: one(leagues, {
    fields: [seasons.leagueId],
    references: [leagues.id],
  }),
  divisions: many(divisions),
  teamSeasons: many(teamSeasons),
  games: many(games),
  skaterStats: many(playerGameStats),
  goalieStats: many(goalieGameStats),
  standings: many(teamStandings),
}));

export const divisionsRelations = relations(divisions, ({ one, many }) => ({
  season: one(seasons, {
    fields: [divisions.seasonId],
    references: [seasons.id],
  }),
  teamSeasons: many(teamSeasons),
  games: many(games),
  standings: many(teamStandings),
}));

export const teamsRelations = relations(teams, ({ one, many }) => ({
  league: one(leagues, { fields: [teams.leagueId], references: [leagues.id] }),
  teamSeasons: many(teamSeasons),
}));

export const teamSeasonsRelations = relations(teamSeasons, ({ one, many }) => ({
  team: one(teams, { fields: [teamSeasons.teamId], references: [teams.id] }),
  season: one(seasons, {
    fields: [teamSeasons.seasonId],
    references: [seasons.id],
  }),
  division: one(divisions, {
    fields: [teamSeasons.divisionId],
    references: [divisions.id],
  }),
  rosters: many(rosters),
  homeGames: many(games, { relationName: "homeTeam" }),
  awayGames: many(games, { relationName: "awayTeam" }),
  skaterStats: many(playerGameStats),
  goalieStats: many(goalieGameStats),
  standings: many(teamStandings),
}));

export const arenasRelations = relations(arenas, ({ many }) => ({
  games: many(games),
}));

export const playersRelations = relations(players, ({ many }) => ({
  rosters: many(rosters),
}));

export const rostersRelations = relations(rosters, ({ one, many }) => ({
  teamSeason: one(teamSeasons, {
    fields: [rosters.teamSeasonId],
    references: [teamSeasons.id],
  }),
  player: one(players, {
    fields: [rosters.playerId],
    references: [players.id],
  }),
  skaterStats: many(playerGameStats),
  goalieStats: many(goalieGameStats),
}));

export const gamesRelations = relations(games, ({ one, many }) => ({
  season: one(seasons, { fields: [games.seasonId], references: [seasons.id] }),
  division: one(divisions, {
    fields: [games.divisionId],
    references: [divisions.id],
  }),
  arena: one(arenas, { fields: [games.arenaId], references: [arenas.id] }),
  homeTeam: one(teamSeasons, {
    fields: [games.homeTeamSeasonId],
    references: [teamSeasons.id],
    relationName: "homeTeam",
  }),
  awayTeam: one(teamSeasons, {
    fields: [games.awayTeamSeasonId],
    references: [teamSeasons.id],
    relationName: "awayTeam",
  }),
  skaterStats: many(playerGameStats),
  goalieStats: many(goalieGameStats),
}));

export const skaterGameStatsRelations = relations(
  playerGameStats,
  ({ one }) => ({
    game: one(games, {
      fields: [playerGameStats.gameId],
      references: [games.id],
    }),
    season: one(seasons, {
      fields: [playerGameStats.seasonId],
      references: [seasons.id],
    }),
    teamSeason: one(teamSeasons, {
      fields: [playerGameStats.teamSeasonId],
      references: [teamSeasons.id],
    }),
    roster: one(rosters, {
      fields: [playerGameStats.rosterId],
      references: [rosters.id],
    }),
  })
);

export const goalieGameStatsRelations = relations(
  goalieGameStats,
  ({ one }) => ({
    game: one(games, {
      fields: [goalieGameStats.gameId],
      references: [games.id],
    }),
    season: one(seasons, {
      fields: [goalieGameStats.seasonId],
      references: [seasons.id],
    }),
    teamSeason: one(teamSeasons, {
      fields: [goalieGameStats.teamSeasonId],
      references: [teamSeasons.id],
    }),
    roster: one(rosters, {
      fields: [goalieGameStats.rosterId],
      references: [rosters.id],
    }),
  })
);

export const teamStandingsRelations = relations(teamStandings, ({ one }) => ({
  season: one(seasons, {
    fields: [teamStandings.seasonId],
    references: [seasons.id],
  }),
  division: one(divisions, {
    fields: [teamStandings.divisionId],
    references: [divisions.id],
  }),
  teamSeason: one(teamSeasons, {
    fields: [teamStandings.teamSeasonId],
    references: [teamSeasons.id],
  }),
}));

// =====================
// TYPES (handy for service layer)
// =====================
export type League = typeof leagues.$inferSelect;
export type NewLeague = typeof leagues.$inferInsert;
export type Season = typeof seasons.$inferSelect;
export type NewSeason = typeof seasons.$inferInsert;
export type Division = typeof divisions.$inferSelect;
export type NewDivision = typeof divisions.$inferInsert;
export type Team = typeof teams.$inferSelect;
export type NewTeam = typeof teams.$inferInsert;
export type TeamSeason = typeof teamSeasons.$inferSelect;
export type NewTeamSeason = typeof teamSeasons.$inferInsert;
export type Arena = typeof arenas.$inferSelect;
export type NewArena = typeof arenas.$inferInsert;
export type Player = typeof players.$inferSelect;
export type NewPlayer = typeof players.$inferInsert;
export type Roster = typeof rosters.$inferSelect;
export type NewRoster = typeof rosters.$inferInsert;
export type Game = typeof games.$inferSelect;
export type NewGame = typeof games.$inferInsert;
export type SkaterGameStat = typeof playerGameStats.$inferSelect;
export type NewSkaterGameStat = typeof playerGameStats.$inferInsert;
export type GoalieGameStat = typeof goalieGameStats.$inferSelect;
export type NewGoalieGameStat = typeof goalieGameStats.$inferInsert;
export type TeamStanding = typeof teamStandings.$inferSelect;
export type NewTeamStanding = typeof teamStandings.$inferInsert;

// =====================
// NOTES
// - Keep seasonId/teamSeasonId in stats rows to make season aggregates simple.
// - Consider lightweight checks in app logic: ensure stats.seasonId == game.seasonId and stats.teamSeasonId == roster.teamSeasonId.
// - Supabase migration: export this file, then generate SQL via drizzle-kit.
