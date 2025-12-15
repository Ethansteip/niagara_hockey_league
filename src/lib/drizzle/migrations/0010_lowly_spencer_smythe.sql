ALTER TABLE "players" ADD COLUMN "profile_id" integer;--> statement-breakpoint
ALTER TABLE "players" ADD CONSTRAINT "players_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "players" DROP COLUMN "preferred_name";--> statement-breakpoint
ALTER TABLE "players" DROP COLUMN "email";--> statement-breakpoint
ALTER TABLE "players" DROP COLUMN "phone";--> statement-breakpoint
ALTER TABLE "players" DROP COLUMN "birthdate";--> statement-breakpoint
ALTER TABLE "profiles" DROP COLUMN "position";