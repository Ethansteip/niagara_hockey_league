<script lang="ts" module>
	import {
		BookOpenIcon, 
		BotIcon, 
		ChartPieIcon, 
		FrameIcon, 
		LifeBuoyIcon, 
		MapIcon, 
		SendIcon, 
		Settings2Icon, 
		SquareTerminalIcon,
		Zap
	} from "@lucide/svelte";

	const data = {
		navMain: [
			{
				title: "Games",
				url: "#",
				icon: SquareTerminalIcon,
				isActive: true,
				items: [
					{
						title: "All",
						url: "#",
					},
					{
						title: "Upcoming",
						url: "#",
					},
					{
						title: "History",
						url: "#",
					}
				],
			}
		],
		navSecondary: [
			{
				title: "Feedback",
				url: "#",
				icon: SendIcon,
			},
		],
		projects: [
			{
				name: "My Team",
				url: "#",
				icon: FrameIcon,
			},
			{
				name: "Standings",
				url: "#",
				icon: ChartPieIcon,
			},
		],
	};
</script>

<script lang="ts">
  import NavMain from "$lib/components/layout/app/dashboard/NavMain.svelte"
	import NavProjects from "$lib/components/layout/app/dashboard/NavProjects.svelte";
	import NavSecondary from "$lib/components/layout/app/dashboard/NavSecondary.svelte";
	import NavUser from "$lib/components/layout/web/NavUser.svelte";
	import * as Sidebar from "$lib/components/ui/sidebar/index.js";
	import { PUBLIC_APP_NAME } from "$env/static/public";

	let { ref = $bindable(null), session, profile, ...restProps } = $props();
</script>

<Sidebar.Root bind:ref variant="inset" {...restProps}>
	<Sidebar.Header>
		<Sidebar.Menu>
			<Sidebar.MenuItem>
				<Sidebar.MenuButton size="lg">
					{#snippet child({ props })}
						<a href="/app" {...props}>
							<div
								class="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg"
							>
								<Zap class="size-4" />
							</div>
							<div class="grid flex-1 text-left text-sm leading-tight">
								<span class="truncate font-medium">{PUBLIC_APP_NAME}</span>
							</div>
						</a>
					{/snippet}
				</Sidebar.MenuButton>
			</Sidebar.MenuItem>
		</Sidebar.Menu>
	</Sidebar.Header>
	<Sidebar.Content>
		<NavMain items={data.navMain} />
		<NavProjects projects={data.projects} />
		<NavSecondary items={data.navSecondary} class="mt-auto" />
	</Sidebar.Content>
	<Sidebar.Footer>
		<NavUser  {profile} isDashboard={true}/>
	</Sidebar.Footer>
</Sidebar.Root>
