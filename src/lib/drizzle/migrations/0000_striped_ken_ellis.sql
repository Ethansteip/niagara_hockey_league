CREATE TYPE "public"."decided_in_enum" AS ENUM('regulation', 'overtime', 'shootout');--> statement-breakpoint
CREATE TYPE "public"."game_status_enum" AS ENUM('scheduled', 'in_progress', 'final', 'forfeit', 'cancelled', 'postponed');--> statement-breakpoint
CREATE TYPE "public"."game_type_enum" AS ENUM('regular season', 'playoff');--> statement-breakpoint
CREATE TYPE "public"."player_role_enum" AS ENUM('player', 'goalie');--> statement-breakpoint
CREATE TABLE "games" (
	"id" serial PRIMARY KEY NOT NULL,
	"season_id" integer NOT NULL,
	"home_team_id" integer NOT NULL,
	"away_team_id" integer NOT NULL,
	"week_number" integer,
	"start_date" timestamp with time zone NOT NULL,
	"home_team_season_id" integer NOT NULL,
	"away_team_season_id" integer NOT NULL,
	"status" "game_status_enum" DEFAULT 'scheduled' NOT NULL,
	"game_type" "game_type_enum" DEFAULT 'regular season' NOT NULL,
	"home_score" integer DEFAULT 0 NOT NULL,
	"away_score" integer DEFAULT 0 NOT NULL,
	"decided_in" "decided_in_enum",
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "goalies_games" (
	"id" serial PRIMARY KEY NOT NULL,
	"player_id" integer NOT NULL,
	"game_id" integer NOT NULL,
	"team_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "players_stats" (
	"id" serial PRIMARY KEY NOT NULL,
	"player_id" integer NOT NULL,
	"game_id" integer NOT NULL,
	"goals" integer DEFAULT 0 NOT NULL,
	"assists" integer DEFAULT 0 NOT NULL,
	"penalty_minutes" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "players" (
	"id" serial PRIMARY KEY NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"role" "player_role_enum" DEFAULT 'player' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rosters" (
	"id" serial PRIMARY KEY NOT NULL,
	"team_season_id" integer NOT NULL,
	"player_id" integer NOT NULL,
	"jersey_number" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "seasons" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"active" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "standings" (
	"id" serial PRIMARY KEY NOT NULL,
	"season_id" integer NOT NULL,
	"team_season_id" integer NOT NULL,
	"team_id" integer NOT NULL,
	"regular_season_games_played" integer DEFAULT 0 NOT NULL,
	"regular_season_wins" integer DEFAULT 0 NOT NULL,
	"regular_season_ties" integer DEFAULT 0 NOT NULL,
	"regular_season_losses" integer DEFAULT 0 NOT NULL,
	"regular_season_points" integer DEFAULT 0 NOT NULL,
	"regular_season_goals_for" integer DEFAULT 0 NOT NULL,
	"regular_season_goals_against" integer DEFAULT 0 NOT NULL,
	"playoff_games_played" integer DEFAULT 0 NOT NULL,
	"playoff_wins" integer DEFAULT 0 NOT NULL,
	"playoff_ties" integer DEFAULT 0 NOT NULL,
	"playoff_losses" integer DEFAULT 0 NOT NULL,
	"playoff_points" integer DEFAULT 0 NOT NULL,
	"playoff_goals_for" integer DEFAULT 0 NOT NULL,
	"playoff_goals_against" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "team_seasons" (
	"id" serial PRIMARY KEY NOT NULL,
	"team_id" integer NOT NULL,
	"season_id" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "teams" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"short_name" text,
	"logo_url" text,
	"code" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "games" ADD CONSTRAINT "games_season_id_seasons_id_fk" FOREIGN KEY ("season_id") REFERENCES "public"."seasons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "games" ADD CONSTRAINT "games_home_team_id_teams_id_fk" FOREIGN KEY ("home_team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "games" ADD CONSTRAINT "games_away_team_id_teams_id_fk" FOREIGN KEY ("away_team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "games" ADD CONSTRAINT "games_home_team_season_id_team_seasons_id_fk" FOREIGN KEY ("home_team_season_id") REFERENCES "public"."team_seasons"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "games" ADD CONSTRAINT "games_away_team_season_id_team_seasons_id_fk" FOREIGN KEY ("away_team_season_id") REFERENCES "public"."team_seasons"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "goalies_games" ADD CONSTRAINT "goalies_games_player_id_players_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "goalies_games" ADD CONSTRAINT "goalies_games_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "goalies_games" ADD CONSTRAINT "goalies_games_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "players_stats" ADD CONSTRAINT "players_stats_player_id_players_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "players_stats" ADD CONSTRAINT "players_stats_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rosters" ADD CONSTRAINT "rosters_team_season_id_team_seasons_id_fk" FOREIGN KEY ("team_season_id") REFERENCES "public"."team_seasons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rosters" ADD CONSTRAINT "rosters_player_id_players_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "standings" ADD CONSTRAINT "standings_season_id_seasons_id_fk" FOREIGN KEY ("season_id") REFERENCES "public"."seasons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "standings" ADD CONSTRAINT "standings_team_season_id_team_seasons_id_fk" FOREIGN KEY ("team_season_id") REFERENCES "public"."team_seasons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "standings" ADD CONSTRAINT "standings_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_seasons" ADD CONSTRAINT "team_seasons_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_seasons" ADD CONSTRAINT "team_seasons_season_id_seasons_id_fk" FOREIGN KEY ("season_id") REFERENCES "public"."seasons"("id") ON DELETE cascade ON UPDATE no action;