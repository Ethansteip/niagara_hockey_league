import { fail, redirect } from "@sveltejs/kit";
import { getFormData } from "$lib/server/event.js";

export const load = async ({ locals: { getSession } }) => {
  const session = await getSession();

  /* User is already logged in. */
  if (session) redirect(303, "/app");
};

export const actions = {
  default: async ({ locals: { supabase } }) => {
    const { email } = await getFormData("email");

    if (!email)
      return fail(400, {
        success: false,
        message: "Please enter an email.",
        email,
      });

    const { error, data } = await supabase.auth.resetPasswordForEmail(email);

    /*
     * We always return success because we don't
     * want to expose which emails exist/don't exist to bad actors.
     */

    return {
      success: true,
      message: "Please check your email to reset your password.",
    };
  },
};
