<script lang="ts">
  import '../../app.css';
  import * as Sidebar from "$lib/components/ui/sidebar/index.js";
	import AppSidebar from "$lib/components/layout/web/AppSidebar/app-sidebar.svelte";
	import SiteHeader from "$lib/components/layout/web/AppSidebar/site-header.svelte";

  let { data, children } = $props();
  let profile = $derived(data?.profile);
  let supabase = $derived(data?.supabase);
  let session = $derived(data?.session);
</script>

<Sidebar.Provider
	style="--sidebar-width: calc(var(--spacing) * 72); --header-height: calc(var(--spacing) * 12);"
>
	<AppSidebar variant="inset" />
	<Sidebar.Inset>
		<SiteHeader />
		<div class="flex flex-1 flex-col">
			<div class="@container/main flex flex-1 flex-col gap-2">
				<div class="flex flex-col gap-4 p-4 md:gap-6 md:py-6 items-center">
					{@render children?.()}
				</div>
			</div>
		</div>
	</Sidebar.Inset>
</Sidebar.Provider>

