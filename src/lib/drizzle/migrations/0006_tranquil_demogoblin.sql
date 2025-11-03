CREATE TABLE "profiles" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"position" "position_enum",
	"avatar_url" text
);
--> statement-breakpoint
ALTER TABLE "players" ALTER COLUMN "position" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "profiles" ALTER COLUMN "position" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."position_enum";--> statement-breakpoint
CREATE TYPE "public"."position_enum" AS ENUM('Goalie', 'Defence', 'Left-wing', 'Center', 'Right-wing');--> statement-breakpoint
ALTER TABLE "players" ALTER COLUMN "position" SET DATA TYPE "public"."position_enum" USING "position"::"public"."position_enum";--> statement-breakpoint
ALTER TABLE "profiles" ALTER COLUMN "position" SET DATA TYPE "public"."position_enum" USING "position"::"public"."position_enum";