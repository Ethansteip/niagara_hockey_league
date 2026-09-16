ALTER TABLE "rosters_players" RENAME COLUMN "rosters_id" TO "roster_id";--> statement-breakpoint
ALTER TABLE "rosters_players" DROP CONSTRAINT "rosters_players_rosters_id_rosters_id_fk";
--> statement-breakpoint
ALTER TABLE "rosters_players" ADD CONSTRAINT "rosters_players_roster_id_rosters_id_fk" FOREIGN KEY ("roster_id") REFERENCES "public"."rosters"("id") ON DELETE cascade ON UPDATE no action;