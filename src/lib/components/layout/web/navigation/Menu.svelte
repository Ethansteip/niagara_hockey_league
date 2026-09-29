<script lang="ts">
	import * as Popover from '$lib/components/ui/popover/index.js';
	import Button from '$lib/components/ui/button/button.svelte';
	import { Menu, CalendarCheck, Calendar, ChartColumn, House } from '@lucide/svelte';
	import Separator from '$lib/components/ui/separator/separator.svelte';

	let open = $state(false);

	const handleClose = () => (open = false);
</script>

<Popover.Root bind:open>
	<Popover.Trigger>
		<Button variant="ghost" size="icon">
			<Menu class="size-6 stroke-2 text-primary-foreground" />
		</Button>
	</Popover.Trigger>
	<Popover.Content sideOffset={25} class="mr-[3vw] border-2 border-primary/50">
		<Button href="/" variant="ghost" class="flex justify-start gap-2" onclick={handleClose}>
			<House />
			Home
		</Button>
		<Button
			href="/games/upcoming"
			variant="ghost"
			class="flex justify-start gap-2"
			onclick={handleClose}
		>
			<CalendarCheck />
			Upcoming Games
		</Button>
		<Button href="/" variant="ghost" class="flex justify-start gap-2" onclick={handleClose}>
			<Calendar />
			Game History
		</Button>
		<Separator />
		<Button href="/" variant="ghost" class="flex justify-start gap-2" onclick={handleClose}>
			<ChartColumn />
			Player Stats
		</Button>
	</Popover.Content>
</Popover.Root>
