DROP INDEX "goalie_games_unique";--> statement-breakpoint
ALTER TABLE "goalies_games" ALTER COLUMN "player_id" DROP NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "goalie_games_team_unique" ON "goalies_games" USING btree ("game_id","team_id");