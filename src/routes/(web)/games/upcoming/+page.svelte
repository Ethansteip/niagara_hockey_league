<script lang="ts">
	import { type GameCardData, getGameCardData } from '$lib/remote/games/games.remote';
	import GameCard from '../../GameCard.svelte';
	const games = $derived<GameCardData[]>(await getGameCardData({ status: 'scheduled' }));
	const test = [];
</script>

<main class="flex w-full flex-col gap-4 md:grid md:grid-cols-2">
	<h1 class="text-[1.5rem] font-bold text-primary-foreground md:text-2xl">Upcoming Games</h1>
	{#if !games.length}
		<div class="flex h-100 w-full items-center justify-center rounded-lg bg-secondary">
			<p class="text-md font-semibold">No Upcoming Games Found...</p>
		</div>
	{:else}
		{#each games as game (game.id)}
			<GameCard {game} />
		{/each}
	{/if}
</main>
