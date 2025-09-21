import { fail } from "@sveltejs/kit";
import { getFormData } from "$lib/server/event.js";
import { getValidatedSession } from "$lib/utils.js";

export const actions = {
  default: async ({ locals: { supabase } }) => {
    const { password, confirmPassword } = await getFormData(
      "password",
      "confirmPassword"
    );

    if (!password || !confirmPassword)
      return fail(400, {
        success: false,
        message: "Please enter a password and confirm it.",
      });

    const session = await getValidatedSession(supabase);

    /*
     * The user will automatically be logged in after clicking the
     * reset password link in their email. They will need to be logged in
     * to reset their password.
     */
    if (session?.access_token) {
      const { data, error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        return fail(400, {
          success: false,
          message: error.message ?? "Something went wrong.",
        });
      }

      return {
        success: true,
        message: "Password reset successfully.",
      };
    }

    return {
      success: false,
      message:
        "You must be logged in to reset your password. Try requesting another password reset email.",
    };
  },
};
