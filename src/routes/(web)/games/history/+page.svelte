<script lang="ts">
	import { type GameCardData, getGameCardData } from '$lib/remote/games/games.remote';
	import GameFinalCard from '../../GameFinalCard.svelte';

	const games = $derived<GameCardData[]>((await getGameCardData({ status: 'final' })).toReversed());

	const monthFormat = new Intl.DateTimeFormat('en-CA', {
		month: 'long',
		year: 'numeric',
		timeZone: 'America/Toronto'
	});

	const gamesByMonth = $derived(
		Map.groupBy(games, (game) => monthFormat.format(new Date(game.startDate)))
	);
</script>

<main class="grid w-full grid-cols-1 gap-4 md:grid-cols-2">
	<h1 class="text-[1.5rem] font-bold text-primary-foreground md:col-span-full md:text-2xl">
		Game History
	</h1>
	{#if !games.length}
		<div
			class="flex h-100 w-full items-center justify-center rounded-lg bg-secondary md:col-span-full"
		>
			<p class="text-md font-semibold">No games have been played yet this season.</p>
		</div>
	{:else}
		{#each gamesByMonth as [month, monthGames] (month)}
			<h2 class="mt-2 text-xl font-semibold text-muted-foreground md:col-span-full">
				{month}
			</h2>
			{#each monthGames as game (game.id)}
				<GameFinalCard {game} />
			{/each}
		{/each}
	{/if}
</main>
