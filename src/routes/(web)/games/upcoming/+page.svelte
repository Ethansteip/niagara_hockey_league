<script lang="ts">
	import { type GameCardData, getGameCardData } from '$lib/remote/games/games.remote';
	import GameCard from '../../GameCard.svelte';
	const games = $derived<GameCardData[]>(await getGameCardData({ status: 'scheduled' }));

	const monthFormat = new Intl.DateTimeFormat('en-CA', {
		month: 'long',
		year: 'numeric',
		timeZone: 'America/Toronto'
	});

	// Games are already sorted by startDate, so groups come out in chronological order
	const gamesByMonth = $derived(
		Map.groupBy(games, (game) => monthFormat.format(new Date(game.startDate)))
	);
</script>

<main class="flex w-full flex-col gap-4 md:grid md:grid-cols-2">
	<h1 class="text-[1.5rem] font-bold text-primary-foreground md:text-2xl">Upcoming Games</h1>
	{#if !games.length}
		<div class="flex h-100 w-full items-center justify-center rounded-lg bg-secondary">
			<p class="text-md font-semibold">No Upcoming Games Found...</p>
		</div>
	{:else}
		{#each gamesByMonth as [month, monthGames] (month)}
			<h2 class="text-xl font-semibold text-secondary-foreground md:col-span-full">{month}</h2>
			{#each monthGames as game (game.id)}
				<GameCard {game} />
			{/each}
		{/each}
	{/if}
</main>
