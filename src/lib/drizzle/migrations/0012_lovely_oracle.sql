DROP TABLE "player_game_stats" CASCADE;--> statement-breakpoint
DROP TYPE "public"."position_enum";--> statement-breakpoint
CREATE TYPE "public"."position_enum" AS ENUM('player', 'goalie');--> statement-breakpoint
ALTER TABLE "players" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "rosters" ADD COLUMN "goals" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "rosters" ADD COLUMN "assists" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "rosters" ADD COLUMN "penalty_minutes" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "rosters" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "rosters" DROP COLUMN "is_captain";--> statement-breakpoint
ALTER TABLE "rosters" DROP COLUMN "is_alternate";