ALTER TABLE "rosters" DROP CONSTRAINT "rosters_player_id_players_id_fk";
--> statement-breakpoint
ALTER TABLE "players" ADD COLUMN "active" boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE "rosters" ADD CONSTRAINT "rosters_player_id_players_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id") ON DELETE cascade ON UPDATE no action;