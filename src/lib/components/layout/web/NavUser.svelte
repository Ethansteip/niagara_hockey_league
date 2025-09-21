<script lang="ts">
	import { 
		BellIcon, 
		ChevronsUpDownIcon, 
		CreditCardIcon, 
		LogOutIcon, 
		SparklesIcon, 
		HouseIcon, 
		BadgeCheckIcon 
	} from "@lucide/svelte";
	import * as Avatar from "$lib/components/ui/avatar/index.js";
	import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
	import { Button } from "$lib/components/ui/button/index.js";

	let {
		user,
	}: {
		user: {
			name: string;
			email: string;
			avatar: string;
		};
	} = $props();

	let logoutForm: HTMLFormElement;
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger>
		<Button variant="ghost" size="lg" class="h-auto gap-2 px-2 py-1.5">
			<Avatar.Root class="size-8 rounded-lg">
				<Avatar.Image src={user.avatar} alt={user.name} />
				<Avatar.Fallback class="rounded-lg">CN</Avatar.Fallback>
			</Avatar.Root>
			<div class="grid flex-1 text-left text-sm leading-tight">
				<span class="truncate font-medium">{user.name}</span>
				<span class="truncate text-xs">{user.email}</span>
			</div>
			<ChevronsUpDownIcon class="ml-auto size-4" />
		</Button>
	</DropdownMenu.Trigger>
	<DropdownMenu.Content
		class="w-56 min-w-56 rounded-lg"
		side="bottom"
		align="end"
		sideOffset={4}
	>
		<DropdownMenu.Label class="p-0 font-normal">
			<div class="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
				<Avatar.Root class="size-8 rounded-lg">
					<Avatar.Image src={user.avatar} alt={user.name} />
					<Avatar.Fallback class="rounded-lg">CN</Avatar.Fallback>
				</Avatar.Root>
				<div class="grid flex-1 text-left text-sm leading-tight">
					<span class="truncate font-medium">{user.name}</span>
					<span class="truncate text-xs">{user.email}</span>
				</div>
			</div>
		</DropdownMenu.Label>
		<DropdownMenu.Separator />
		<DropdownMenu.Group>
			<DropdownMenu.Item>
				<SparklesIcon class="size-4" />
				Upgrade to Pro
			</DropdownMenu.Item>
		</DropdownMenu.Group>
		<DropdownMenu.Separator />
		<DropdownMenu.Group>
			<a href="/app">
				<DropdownMenu.Item>
					<HouseIcon class="size-4" />
					Dashboard
				</DropdownMenu.Item>
			</a>
			<DropdownMenu.Item>
				<BadgeCheckIcon class="size-4" />
				Account
			</DropdownMenu.Item>
			<DropdownMenu.Item>
				<CreditCardIcon class="size-4" />
				Billing
			</DropdownMenu.Item>
			<DropdownMenu.Item>
				<BellIcon class="size-4" />
				Notifications
			</DropdownMenu.Item>
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
