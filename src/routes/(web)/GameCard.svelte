<script lang="ts">
	import Logo, { type TeamName } from '$lib/components/layout/assets/Logo.svelte';
	import type { GameCardData, TeamStanding } from '$lib/remote/games/games.remote';
	import Badge from '$lib/components/ui/badge/badge.svelte';

	let { game }: { game: GameCardData } = $props();

	const dateFormat = new Intl.DateTimeFormat('en-CA', {
		weekday: 'short',
		month: 'short',
		day: 'numeric',
		timeZone: 'America/Toronto'
	});

	const timeFormat = new Intl.DateTimeFormat('en-CA', {
		hour: 'numeric',
		minute: '2-digit',
		timeZone: 'America/Toronto'
	});

	const startDate = $derived(new Date(game.startDate));
</script>

{#snippet teamRow(team: TeamStanding | undefined)}
	<div class="flex items-center justify-between gap-2">
		<p class="truncate text-sm font-semibold">{team?.teamName ?? 'TBD'}</p>
		<p class="text-xs text-muted-foreground tabular-nums">
			{#if team}
				{team.regularSeasonWins}-{team.regularSeasonLosses}-{team.regularSeasonTies}
			{:else}
				&ndash;
			{/if}
		</p>
	</div>
{/snippet}

<article
	class="flex h-full flex-col gap-4 rounded-2xl border bg-card p-3 text-card-foreground shadow-sm"
>
	<header class="flex items-center justify-between gap-2">
		<Badge class="">{dateFormat.format(startDate)}</Badge>
		<time datetime={startDate.toISOString()} class="text-xs font-medium text-muted-foreground">
			{timeFormat.format(startDate)}
		</time>
	</header>

	<div class="flex items-center justify-center gap-12">
		{#each [game.homeTeam, game.awayTeam] as team, i (i)}
			<div class="flex flex-col items-center justify-center gap-2">
				<Logo name={team?.teamName as TeamName} className="size-25" />
				<div class="flex flex-col items-center">
					<p class="text-lg font-semibold tracking-wide text-secondary-foreground">
						{team?.teamName}
					</p>
					<p class="text-xs text-muted-foreground tabular-nums">
						{#if team}
							{team.regularSeasonWins}-{team.regularSeasonLosses}-{team.regularSeasonTies}
						{:else}
							&ndash;
						{/if}
					</p>
				</div>
			</div>
		{/each}
	</div>

	<!-- <div class="flex flex-col gap-1">
		{@render teamRow(game.homeTeam)}
		{@render teamRow(game.awayTeam)}
	</div> -->
</article>
