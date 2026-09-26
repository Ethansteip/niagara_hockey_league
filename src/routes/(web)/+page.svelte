<script lang="ts">
	import GameCard from './GameCard.svelte';
	import Hero from './Hero.svelte';
	import * as Carousel from '$lib/components/ui/carousel/index.js';
	import type { CarouselAPI } from '$lib/components/ui/carousel/context.js';
	import { getGameCardData, type GameCardData } from '$lib/remote/games/games.remote';
	import { getPointsProgression } from '$lib/remote/standings/standings.remote';
	import PointsChart from '$lib/components/standings/PointsChart.svelte';
	import { getActiveSeasonSummary } from '$lib/remote/seasons/seasons.remote';

	const games = $derived<GameCardData[]>(await getGameCardData({ status: 'scheduled', limit: 4 }));
	const pointsProgression = $derived(await getPointsProgression());
	const season = $derived(await getActiveSeasonSummary());

	let carouselApi = $state<CarouselAPI>();
	let selectedIndex = $state(0);

	$effect(() => {
		const api = carouselApi;
		if (!api) return;

		const update = () => (selectedIndex = api.selectedScrollSnap());

		update();
		api.on('select', update).on('reInit', update);
		return () => {
			api.off('select', update).off('reInit', update);
		};
	});
</script>

<div class="flex min-h-screen flex-col items-center justify-start gap-8 pb-10">
	<div class="mt-1 w-full md:mt-6">
		<Hero
			{season}
			nextGame={games[0]}
			teamNames={pointsProgression.teams.map((team) => team.name)}
		/>
	</div>
	<section id="upcoming-games" class="flex w-full scroll-mt-6 flex-col gap-1">
		<div class="flex w-full items-baseline justify-between">
			<h2 class="text-[1.5rem] font-bold text-primary-foreground md:text-2xl">Upcoming Games</h2>
			<a href="/games" class=" tracking-wide text-secondary-foreground">View All</a>
		</div>
		<!-- Desktop Game Cards -->
		<div class="hidden grid-cols-2 gap-3 md:grid">
			{#each games as game (game.id)}
				<div class="col-span-1">
					<GameCard {game} />
				</div>
			{/each}
		</div>
		<!-- Mobile Game Cards -->
		<Carousel.Root
			opts={{ align: 'start' }}
			setApi={(api) => (carouselApi = api)}
			class="flex w-full md:hidden"
		>
			<Carousel.Content class="-ms-3 py-1">
				{#each games as game (game.id)}
					<Carousel.Item class="basis-[95%] ps-3 sm:basis-1/3 md:basis-1/4">
						<GameCard {game} />
					</Carousel.Item>
				{/each}
			</Carousel.Content>
		</Carousel.Root>
		<div class="flex items-center justify-center gap-1 md:hidden">
			{#each games as game, i (game.id)}
				<div
					class={[
						'size-3 rounded-full transition-all duration-500',
						i === selectedIndex ? 'h-3 w-5 bg-primary' : 'bg-secondary'
					]}
				></div>
			{/each}
		</div>
	</section>
	<section class="flex w-full flex-col gap-1">
		<div class="flex flex-col">
			<h2 class="text-[1.5rem] font-bold text-primary-foreground md:text-2xl">Standings</h2>
			<p class="text-sm text-muted-foreground">
				The points race, week by week. Tap a team to follow their climb.
			</p>
		</div>
		<div class="rounded-2xl border bg-card p-3 text-card-foreground shadow-sm">
			<PointsChart data={pointsProgression} />
		</div>
	</section>
</div>
