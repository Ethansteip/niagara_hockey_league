CREATE INDEX "games_schedule_idx" ON "games" USING btree ("season_id","start_date");--> statement-breakpoint
CREATE INDEX "goalie_games_idx" ON "goalies_games" USING btree ("player_id","game_id");--> statement-breakpoint
CREATE UNIQUE INDEX "goalie_games_unique" ON "goalies_games" USING btree ("player_id","game_id");--> statement-breakpoint
CREATE UNIQUE INDEX "player_game_unique" ON "players_stats" USING btree ("player_id","game_id");--> statement-breakpoint
CREATE INDEX "player_stat_idx" ON "players_stats" USING btree ("player_id");--> statement-breakpoint
CREATE INDEX "game_stat_idx" ON "players_stats" USING btree ("game_id");--> statement-breakpoint
CREATE UNIQUE INDEX "team_game_points_unique" ON "points" USING btree ("game_id","team_id");--> statement-breakpoint
CREATE UNIQUE INDEX "roster_team_season_unique" ON "rosters" USING btree ("team_season_id");--> statement-breakpoint
CREATE UNIQUE INDEX "roster_player_unique" ON "rosters_players" USING btree ("roster_id","player_id");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_season_name" ON "seasons" USING btree ("name");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_active_season" ON "seasons" USING btree ("active") WHERE active = true;--> statement-breakpoint
CREATE UNIQUE INDEX "team_standings_unique" ON "standings" USING btree ("season_id","team_season_id");--> statement-breakpoint
CREATE INDEX "regular_season_points_idx" ON "standings" USING btree ("season_id","regular_season_points");--> statement-breakpoint
CREATE INDEX "playoff_points_idx" ON "standings" USING btree ("season_id","playoff_points");--> statement-breakpoint
CREATE UNIQUE INDEX "team_seasons_team_season_unique" ON "team_seasons" USING btree ("team_id","season_id");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_team_name" ON "teams" USING btree ("name");