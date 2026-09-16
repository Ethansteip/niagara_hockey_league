CREATE TABLE "rosters_players" (
	"id" serial PRIMARY KEY NOT NULL,
	"rosters_id" integer NOT NULL,
	"player_id" integer NOT NULL,
	"jersey_number" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "rosters" DROP CONSTRAINT "rosters_player_id_players_id_fk";
--> statement-breakpoint
ALTER TABLE "rosters" ADD COLUMN "season_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "rosters_players" ADD CONSTRAINT "rosters_players_rosters_id_rosters_id_fk" FOREIGN KEY ("rosters_id") REFERENCES "public"."rosters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rosters_players" ADD CONSTRAINT "rosters_players_player_id_players_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rosters" ADD CONSTRAINT "rosters_season_id_seasons_id_fk" FOREIGN KEY ("season_id") REFERENCES "public"."seasons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rosters" DROP COLUMN "player_id";--> statement-breakpoint
ALTER TABLE "rosters" DROP COLUMN "jersey_number";