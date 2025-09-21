<script lang="ts">
  import '../../app.css'
  import AppSidebar from '$lib/components/layout/app/dashboard/AppSidebar.svelte';
  import * as Breadcrumb from "$lib/components/ui/breadcrumb/index.js";
	import { Separator } from "$lib/components/ui/separator/index.js";
	import * as Sidebar from "$lib/components/ui/sidebar/index.js";
  import { Toaster } from '$lib/components/ui/sonner';
  import { goto, invalidate } from '$app/navigation'
  import { onMount } from 'svelte'

  let { data, children } = $props();

  /**
   * We use the $derived rune so that
   * `supabase` and `session` are updated
   * during invalidation. $state doesn't do this.
   * 
   * An updated supabase client isn't typically needed,
   * but the ssr libary returns a cached client
   * for us during invalidation. Otherwise we'd be
   * initializing a client during every invalidation.
   */
  let { supabase, session } = $derived(data);

  onMount(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, _session) => {
      /**
       * Instead of invalidating, you could call
       * `session = _session` below and you wouldn't
       * necessarily need to call `invalidate`.
       */
      if (_session?.expires_at !== session?.expires_at) {
        /**
         * We typically only call `signOut()` on the server side,
         * but if `_session` is null - from the user
         * being deleted or the supabase client
         * failing to refresh a token, for example -
         * the SIGNED_OUT event is fired, and
         * calling `goto` ensures the user's screen 
         * reflects that they're logged out.
         * Note that the invalidation still happens.
         */
        if (event === 'SIGNED_OUT') await goto('/');
        invalidate('supabase:auth')
      }
    })

    return () => subscription.unsubscribe();
  })
</script>

<Toaster />
<Sidebar.Provider>
	<AppSidebar {session}/>
	<Sidebar.Inset>
		<header class="flex h-16 shrink-0 items-center gap-2">
			<div class="flex items-center gap-2 px-4">
				<Sidebar.Trigger class="-ml-1" />
				<Separator orientation="vertical" class="mr-2 data-[orientation=vertical]:h-4" />
				<Breadcrumb.Root>
					<Breadcrumb.List>
						<Breadcrumb.Item class="hidden md:block">
							<Breadcrumb.Link href="#">Building Your Application</Breadcrumb.Link>
						</Breadcrumb.Item>
						<Breadcrumb.Separator class="hidden md:block" />
						<Breadcrumb.Item>
							<Breadcrumb.Page>Data Fetching</Breadcrumb.Page>
						</Breadcrumb.Item>
					</Breadcrumb.List>
				</Breadcrumb.Root>
			</div>
		</header>
    {@render children?.()}
	</Sidebar.Inset>
</Sidebar.Provider>

