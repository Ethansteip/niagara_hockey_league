CREATE TABLE "points" (
	"id" serial PRIMARY KEY NOT NULL,
	"team_id" integer NOT NULL,
	"game_id" integer NOT NULL,
	"points" integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE "goalies_games" ADD COLUMN "created_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "goalies_games" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "points" ADD CONSTRAINT "points_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "points" ADD CONSTRAINT "points_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teams" DROP COLUMN "short_name";