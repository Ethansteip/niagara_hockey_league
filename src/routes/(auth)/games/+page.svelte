<script lang="ts">
	import { getActiveSeasonGames, type GameData } from './games.remote';
	import * as Table from '$lib/components/ui/table/index.js';
	import Button from '$lib/components/ui/button/button.svelte';
	import { List, Plus, SearchAlert, SquarePen, Trash, Zap } from '@lucide/svelte';
	import { toast } from 'svelte-sonner';
	import { page } from '$app/state';
	import { replaceState } from '$app/navigation';
	import { onMount } from 'svelte';
	import Logo, { type TeamName } from '$lib/components/layout/assets/Logo.svelte';

	const games: GameData[] = $derived(await getActiveSeasonGames());

	const gameDateFormat = new Intl.DateTimeFormat('en-CA', {
		weekday: 'short',
		month: 'short',
		day: 'numeric',
		year: 'numeric',
		hour: 'numeric',
		minute: '2-digit',
		timeZone: 'America/Toronto'
	});

	onMount(() => {
		if (page.url.searchParams.get('created')) {
			toast.success('New Game Created');
			const url = new URL(page.url);
			url.searchParams.delete('created');
			replaceState(url, {});
		}

		if (page.url.searchParams.get('updated')) {
			toast.success('Game Edited Successfully');
			const url = new URL(page.url);
			url.searchParams.delete('updated');
			replaceState(url, {});
		}
	});
</script>

<main class="flex flex-col items-center justify-center gap-3">
	<div class="flex w-full items-center justify-between">
		<h2 class="text-left text-lg font-bold md:text-2xl xl:text-3xl">Games</h2>
		{#if games.length}
			<Button href="/games/create">
				New
				<Plus />
			</Button>
		{/if}
	</div>
	<div class="flex w-full items-center justify-start gap-2">
		<List class="size-5" />
		<p>{games.length} game(s)</p>
	</div>
	{#if games.length}
		<Table.Root>
			<Table.Header>
				<Table.Row>
					<Table.Head class="">Week</Table.Head>
					<Table.Head>Home Team</Table.Head>
					<Table.Head>Away Team</Table.Head>
					<Table.Head>Date</Table.Head>
					<Table.Head>Type</Table.Head>
					<Table.Head class="text-end">Edit</Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#each games as game (game.id)}
					<Table.Row>
						<Table.Cell class="font-medium">{game.weekNumber}</Table.Cell>
						<Table.Cell>
							<Logo name={game.homeTeam.name as TeamName} />
						</Table.Cell>
						<Table.Cell>
							<Logo name={game.awayTeam.name as TeamName} />
						</Table.Cell>
						<Table.Cell>{gameDateFormat.format(game.startDate)}</Table.Cell>
						<Table.Cell>{game.gameType}</Table.Cell>
						<Table.Cell class="flex justify-end">
							<Button size="icon" variant="outline" href="/games/{game.id}/edit">
								<SquarePen />
							</Button>
						</Table.Cell>
					</Table.Row>
				{/each}
			</Table.Body>
		</Table.Root>
	{:else}
		<div
			class="border-2-dashed flex h-50 w-full flex-col items-center justify-center gap-2 rounded-lg border-ring bg-secondary md:h-100"
		>
			<p class="semi-bold flex items-center gap-1 text-secondary-foreground italic">
				<SearchAlert class="size-4" />
				No games found.
			</p>
			<Button href="/games/create">
				Create New Game <Plus />
			</Button>
		</div>
	{/if}
</main>
