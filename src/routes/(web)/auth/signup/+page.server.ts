import { fail, redirect } from "@sveltejs/kit";
import { getFormData } from "$lib/server/event.js";
import { db } from "$lib/drizzle/index.js";
import { teams as teamsTable } from "$lib/drizzle/schema.js";
import { eq } from "drizzle-orm";

export const load = async ({ locals: { getSession }, url }) => {
  const session = await getSession();

  /* User is already logged in. */
  if (session) redirect(303, "/app");

  let preSelectedTeam = "";
  const teamCode = url.searchParams.get("teamCode") ?? "";

  // BRUINS_nL%25%261
  // WINGS_fp%242%24
  // HABS_9*%25%251
  // LEAFS_%24v66x!

  if (teamCode) {
    const [preSelectedTeamResult] = await db
      .select({ name: teamsTable.name })
      .from(teamsTable)
      .where(eq(teamsTable.code, teamCode));

    preSelectedTeam = preSelectedTeamResult?.name;
  }

  const teams = await db.select().from(teamsTable);

  return { teamCode, teams, preSelectedTeam };
};

export const actions = {
  default: async ({ locals: { supabase } }) => {
    const { email, password } = await getFormData("email", "password");

    if (!email || !password)
      return fail(400, {
        success: false,
        message: "Please enter an email and password",
        email,
      });

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    console.log(error);

    if (error) {
      return fail(400, {
        success: false,
        message: error.message ?? "Something went wrong",
        email,
      });
    }

    return {
      success: true,
      message: "Please check your email to confirm your signup.",
    };
  },
};
