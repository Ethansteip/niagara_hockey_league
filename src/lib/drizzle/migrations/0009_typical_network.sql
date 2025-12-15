CREATE TYPE "public"."profile_role_enum" AS ENUM('player', 'captain', 'admin');--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "role" "profile_role_enum" DEFAULT 'player' NOT NULL;--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_user_id_unique" UNIQUE("user_id");