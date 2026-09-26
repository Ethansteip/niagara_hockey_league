<script lang="ts">
	import Logo, { type TeamName } from '$lib/components/layout/assets/Logo.svelte';
	import { teamColours } from '$lib/components/layout/assets/team-colours';
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

<article
	class="flex h-full flex-col gap-4 rounded-2xl border-2 border-secondary bg-card p-3 text-card-foreground shadow-sm"
>
	<header class="flex items-center justify-between gap-2">
		<Badge class="">{dateFormat.format(startDate)}</Badge>
		<time datetime={startDate.toISOString()} class="text-sm font-medium text-primary-foreground">
			{timeFormat.format(startDate)}
		</time>
	</header>

	<div class="flex items-center justify-center gap-7 md:gap-10">
		{#each [game.homeTeam, game.awayTeam] as team, i (i)}
			{@const glow = teamColours[team?.teamName as TeamName]?.glow}
			<div class="flex flex-col items-center justify-center gap-2">
				<div
					class="logo-glow"
					style:--glow-inner={glow?.[0] ?? 'transparent'}
					style:--glow-outer={glow?.[1] ?? 'transparent'}
				>
					<Logo name={team?.teamName as TeamName} className="size-25" />
				</div>
				<div class="flex flex-col items-center">
					<p class="text-lg font-semibold tracking-wide text-primary-foreground">
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
			{#if i === 0}
				<div class="-pt-10 flex size-10 items-center justify-center rounded-full bg-muted">
					<p class="text-xs font-bold tracking-wide uppercase">VS</p>
				</div>
			{/if}
		{/each}
	</div>
</article>

<style>
	/* drop-shadow follows the SVG's alpha channel, so the glow hugs the logo's
	   silhouette instead of its bounding box. Three layers with rising blur and
	   falling opacity give a soft, gradual falloff past the edge. */
	.logo-glow :global(svg) {
		filter: drop-shadow(0 0 3px color-mix(in oklab, var(--glow-inner) 40%, transparent))
			drop-shadow(0 0 12px color-mix(in oklab, var(--glow-outer) 25%, transparent))
			drop-shadow(0 0 28px color-mix(in oklab, var(--glow-outer) 15%, transparent));
		transition: filter 200ms ease;
	}

	article:hover .logo-glow :global(svg) {
		filter: drop-shadow(0 0 4px color-mix(in oklab, var(--glow-inner) 55%, transparent))
			drop-shadow(0 0 16px color-mix(in oklab, var(--glow-outer) 35%, transparent))
			drop-shadow(0 0 34px color-mix(in oklab, var(--glow-outer) 20%, transparent));
	}
</style>
