import type { SubmitFunction } from "@sveltejs/kit";
import { toast } from "svelte-sonner";
import { goto } from "$app/navigation";

export interface EnhanceHookOptions {
  successRedirect?: string;
  successToast?: boolean;
  failureToast?: boolean;
  setLoading?: (value: boolean) => void;
}

export function createEnhanceHook({
  successRedirect,
  successToast = false,
  failureToast = true,
  setLoading,
}: EnhanceHookOptions = {}): SubmitFunction {
  /* This function is what SvelteKit will call on form submit */
  return () => {
    setLoading?.(true);
    /* and this function is called *after* the action returns */
    return async ({ result, update }) => {
      /* keep default SvelteKit behavior */
      await update();
      setLoading?.(false);

      if (result.type === "success") {
        if (successToast) {
          const message =
            (result.data as any)?.message ?? "Form submitted succesfully";
          toast.success(String(message));
        }
        if (successRedirect) {
          goto(successRedirect);
        }
      }

      if (result.type === "failure") {
        if (failureToast) {
          const message =
            (result.data as any)?.message ?? "Something went wrong";
          toast.error(String(message));
        }
      }
    };
  };
}
