<script lang="ts">
	import { 
		ChevronsUpDownIcon, 
		LogOutIcon,
		HouseIcon, 
		UserPen
	} from "@lucide/svelte";
	import * as Avatar from "$lib/components/ui/avatar/index.js";
	import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
  import type { Profile } from "$lib/drizzle/schema";
	import { useSidebar } from "$lib/components/ui/sidebar/index.js";

	let {
		profile,
		isDashboard = false
	}: {
		profile: Profile;
		isDashboard?: boolean
	} = $props();

	console.log("PROFILE: ", profile);

	const sidebar = useSidebar();
	let logoutForm: HTMLFormElement;
	let fullName = `${profile?.firstName} ${profile?.lastName}`;
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger>
		<Button variant="ghost" size="lg" class="h-auto gap-2 px-2 py-1.5">
			<Avatar.Root class="size-8 rounded-lg">
				<Avatar.Image src={profile?.avatarUrl} alt={fullName} />
				<Avatar.Fallback class="rounded-lg">{profile?.firstName[0]}{profile?.lastName[0]}</Avatar.Fallback>
			</Avatar.Root>
			<div class="grid flex-1 text-left text-sm leading-tight">
				<span class="truncate font-medium">{fullName}</span>
				<span class="truncate text-xs">{profile?.email}</span>
			</div>
			<ChevronsUpDownIcon class="ml-auto size-4" />
		</Button>
	</DropdownMenu.Trigger>
	<DropdownMenu.Content
	class="w-(--bits-dropdown-menu-anchor-width) min-w-56 rounded-lg"
	side={sidebar?.isMobile ? "bottom" : "right"}
	align="end"
	sideOffset={4}
	>
		<DropdownMenu.Label class="p-0 font-normal">
			<div class="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
				<Avatar.Root class="size-8 rounded-lg">
					<Avatar.Image src={profile.avatarUrl} alt={fullName} />
					<Avatar.Fallback class="rounded-lg">{profile?.firstName[0]}{profile?.lastName[0]}</Avatar.Fallback>
				</Avatar.Root>
				<div class="grid flex-1 text-left text-sm leading-tight">
					<span class="truncate text-xs">{fullName}</span>
					<span class="truncate text-xs">{profile?.email}</span>
				</div>
			</div>
		</DropdownMenu.Label>
		<DropdownMenu.Separator />
		<DropdownMenu.Group>
			<a href="/app/profile/{profile?.id}">
				<DropdownMenu.Item>
					<UserPen class="size-4" />
					Profile
				</DropdownMenu.Item>
			</a>
			{#if isDashboard}
			<a href="/">
				<DropdownMenu.Item>
					<HouseIcon class="size-4" />
					Home
				</DropdownMenu.Item>
			</a>
			{:else}
			<a href="/app">
				<DropdownMenu.Item>
					<HouseIcon class="size-4" />
					Dashboard
				</DropdownMenu.Item>
			</a>
			{/if}
		</DropdownMenu.Group>
		<DropdownMenu.Separator />
		<DropdownMenu.Item onclick={() => logoutForm.requestSubmit()}>
			<LogOutIcon class="size-4" />
			Log out
			<form bind:this={logoutForm} method="POST" action="/auth?/signout" class="hidden">
			</form>
		</DropdownMenu.Item>
	</DropdownMenu.Content>
</DropdownMenu.Root>
