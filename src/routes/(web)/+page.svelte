<script lang="ts">
	import GameCard from './GameCard.svelte';
	import * as Carousel from '$lib/components/ui/carousel/index.js';
	import { getGameCardData, type GameCardData } from '$lib/remote/games/games.remote';

	const games = $derived<GameCardData[]>(await getGameCardData({ status: 'scheduled', limit: 4 }));
</script>

<div class="flex h-screen flex-col items-center justify-start">
	<section class="mt-1 flex w-full flex-col gap-1 md:mt-10">
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
		<Carousel.Root opts={{ align: 'start' }} class="flex w-full md:hidden">
			<Carousel.Content class="-ms-3 py-1">
				{#each games as game (game.id)}
					<Carousel.Item class="basis-[95%] ps-3 sm:basis-1/3 md:basis-1/4">
						<GameCard {game} />
					</Carousel.Item>
				{/each}
			</Carousel.Content>
		</Carousel.Root>
	</section>
</div>
