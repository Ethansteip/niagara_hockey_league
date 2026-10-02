<script lang="ts">
	import Logo, { type TeamName } from '$lib/components/layout/assets/Logo.svelte';
	import { teamColours } from '$lib/components/layout/assets/team-colours';
	import type { GameCardData } from '$lib/remote/games/games.remote';
	import Badge from '$lib/components/ui/badge/badge.svelte';

	let { game }: { game: GameCardData } = $props();

	const dateFormat = new Intl.DateTimeFormat('en-CA', {
		weekday: 'short',
		month: 'short',
		day: 'numeric',
		timeZone: 'America/Toronto'
	});

	const startDate = $derived(new Date(game.startDate));
	const isTie = $derived(game.homeScore === game.awayScore);

	const statusLabel = $derived(
		game.decidedIn === 'overtime'
			? 'Final/OT'
			: game.decidedIn === 'shootout'
				? 'Final/SO'
				: 'Final'
	);

	// Scoreboard convention: away on top, home underneath
	const rows = $derived([
		{
			side: 'away',
			team: game.awayTeam,
			score: game.awayScore,
			won: game.awayScore > game.homeScore
		},
		{
			side: 'home',
			team: game.homeTeam,
			score: game.homeScore,
			won: game.homeScore > game.awayScore
		}
	]);
</script>

<article class="overflow-hidden rounded-xl border border-white/5 bg-card text-card-foreground">
	<header
		class="flex items-center justify-between gap-2 border-b border-white/5 px-4 py-2.5 text-xs"
	>
		<div class="flex items-center gap-2">
			<span class="font-bold tracking-widest text-foreground uppercase">{statusLabel}</span>
			{#if isTie}
				<span
					class="rounded-sm bg-secondary px-1.5 py-0.5 text-[0.625rem] font-bold tracking-widest text-secondary-foreground uppercase"
				>
					Tie
				</span>
			{/if}
		</div>
		<div class="flex items-center gap-2 text-muted-foreground">
			{#if game.gameType === 'playoff'}
				<Badge class="h-5 px-1.5 text-[0.625rem] tracking-wider uppercase">Playoffs</Badge>
			{/if}
			<time datetime={startDate.toISOString()}>{dateFormat.format(startDate)}</time>
			{#if game.weekNumber}
				<span aria-hidden="true">·</span>
				<span class="text-secondary-foreground">Week {game.weekNumber}</span>
			{/if}
		</div>
	</header>

	<ul class="flex flex-col py-1.5">
		{#each rows as row (row.side)}
			{@const name = row.team?.teamName as TeamName | undefined}
			<li
				class="team-row relative flex items-center gap-3 px-4 py-2"
				class:winner={row.won}
				class:loser={!row.won && !isTie}
				style:--accent={name ? teamColours[name]?.line : 'transparent'}
			>
				{#if name}
					<Logo {name} className="size-11 shrink-0" />
				{:else}
					<div class="size-11 shrink-0 rounded-full bg-muted"></div>
				{/if}

				<div class="min-w-0 flex-1">
					<p class="team-name truncate text-lg leading-tight font-bold tracking-tight">
						{row.team?.teamName ?? 'TBD'}
					</p>
					<p class="text-xs text-muted-foreground tabular-nums">
						{#if row.team}
							{row.team.regularSeasonWins}-{row.team.regularSeasonTies}-{row.team
								.regularSeasonLosses}
						{:else}
							&ndash;
						{/if}
					</p>
				</div>

				<div class="flex items-center gap-2">
					<span class="score text-4xl leading-none font-black tabular-nums">{row.score}</span>
					<!-- Winner caret; always takes up space so both scores stay aligned -->
					<span
						class="caret size-0 border-y-[5px] border-r-[6px] border-y-transparent border-r-current"
						aria-hidden="true"
					></span>
				</div>

				{#if row.won}
					<span class="sr-only">Winner</span>
				{/if}
			</li>
		{/each}
	</ul>
</article>

<style>
	/* Winner gets a jersey-colour edge and a faint wash bleeding in from the left */
	.team-row.winner {
		background: linear-gradient(
			90deg,
			color-mix(in oklab, var(--accent) 14%, transparent),
			transparent 65%
		);
	}

	.team-row.winner::before {
		content: '';
		position: absolute;
		inset-block: 0.375rem;
		left: 0;
		width: 3px;
		border-radius: 0 2px 2px 0;
		background: var(--accent);
	}

	.team-row .caret {
		opacity: 0;
	}

	.team-row.winner .caret {
		opacity: 1;
	}

	/* Loser fades back so the result reads at a glance */
	.team-row.loser .team-name,
	.team-row.loser .score {
		color: var(--muted-foreground);
	}

	.team-row.loser :global(svg) {
		opacity: 0.55;
	}
</style>
