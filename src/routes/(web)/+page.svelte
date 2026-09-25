<script lang="ts">
	import GameCard from './GameCard.svelte';
	import * as Carousel from '$lib/components/ui/carousel/index.js';
	import { getGameCardData, type GameCardData } from '$lib/remote/games/games.remote';

	const games = $derived<GameCardData[]>(await getGameCardData({ status: 'scheduled', limit: 4 }));
</script>

<div class="flex h-screen flex-col items-center justify-start">
	<section class="mt-5 flex w-full flex-col gap-3 md:mt-10">
		<h2 class="text-xl font-bold md:text-2xl">Upcoming Games</h2>

		<Carousel.Root opts={{ align: 'start' }} class="w-full">
			<Carousel.Content class="-ms-3 py-1">
				{#each games as game (game.id)}
					<Carousel.Item class="basis-[45%] ps-3 sm:basis-1/3 md:basis-1/4">
						<GameCard {game} />
					</Carousel.Item>
				{/each}
			</Carousel.Content>
		</Carousel.Root>
	</section>
</div>
