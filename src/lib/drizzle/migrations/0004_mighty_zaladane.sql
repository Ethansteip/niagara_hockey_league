ALTER TABLE "team_standings" RENAME COLUMN "gp" TO "games_played";--> statement-breakpoint
ALTER TABLE "team_standings" RENAME COLUMN "w" TO "wins";--> statement-breakpoint
ALTER TABLE "team_standings" RENAME COLUMN "l" TO "losses";--> statement-breakpoint
ALTER TABLE "team_standings" RENAME COLUMN "otl" TO "overtime_losses";--> statement-breakpoint
ALTER TABLE "team_standings" RENAME COLUMN "gf" TO "goals_for";--> statement-breakpoint
ALTER TABLE "team_standings" RENAME COLUMN "ga" TO "goals_against";--> statement-breakpoint
ALTER TABLE "team_standings" ADD COLUMN "ties" integer DEFAULT 0 NOT NULL;