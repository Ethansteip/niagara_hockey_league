import { fail, redirect } from "@sveltejs/kit";
import { type Provider } from "@supabase/supabase-js";
import { getFormData } from "$lib/server/event.js";

export const load = async ({ locals: { getSession } }) => {
  const session = await getSession();

  /* User is already logged in. */
  if (session) redirect(303, "/app");
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
