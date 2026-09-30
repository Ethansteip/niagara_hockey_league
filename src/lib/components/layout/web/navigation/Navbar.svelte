<script lang="ts">
	import { Zap } from '@lucide/svelte';
	import Separator from '$lib/components/ui/separator/separator.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import Menu from '$lib/components/layout/web/navigation/Menu.svelte';
	import TuesdayNight from '$lib/components/layout/assets/tuesday-night.png';
</script>

<nav
	class="border-/50 sticky mx-auto my-4 flex h-18 w-full items-center justify-between rounded-lg border-2 bg-muted px-3 md:w-full md:px-6"
>
	<!-- Section 1 -->
	<div class="flex w-1/4 items-center justify-start gap-2 md:w-1/3">
		<a href="/">
			<img src={TuesdayNight} class="h-11 w-auto" alt="Tuesday Night Hockey Logo" />
		</a>
		<div class="hidden w-full gap-2 md:flex">
			<Separator orientation="vertical" />
			<h1 class="text-md md:text-large text-center font-bold text-primary-foreground lg:text-xl">
				Tuesday Night Hockey
			</h1>
		</div>
	</div>
	<!-- Section 2 -->
	<div class="flex w-1/2 justify-center md:hidden">
		<h1 class="text-md text-center font-bold text-primary-foreground">Tuesday Night Hockey</h1>
	</div>
	<!-- Section 3 -->
	<div class="flex w-1/4 md:w-1/2">
		<div class="hidden w-full items-center justify-end gap-2 md:flex">
			<Button variant="outline" href="/games/upcoming">Upcoming Games</Button>
			<Button variant="outline" href="/games/history">Game History</Button>
			<Button variant="outline" href="/">Stats</Button>
		</div>
		<div class="flex w-full items-center justify-end md:hidden">
			<Menu />
		</div>
	</div>
</nav>
