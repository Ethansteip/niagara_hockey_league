<script lang="ts">
	import Logo, { type TeamName } from '$lib/components/layout/assets/Logo.svelte';
	import { teamColours } from '$lib/components/layout/assets/team-colours';
	import type { ActiveSeasonSummary } from '$lib/remote/seasons/seasons.remote';
	import type { GameCardData } from '$lib/remote/games/games.remote';
	import { ArrowDown } from '@lucide/svelte';

	type Props = {
		season: ActiveSeasonSummary | null;
		/* The next scheduled game; its week is treated as the current week */
		nextGame: GameCardData | undefined;
		teamNames: string[];
	};

	let { season, nextGame, teamNames }: Props = $props();

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

	// "2026-2027" -> "2026–27 Season"
	const seasonLabel = $derived.by(() => {
		if (!season) return null;
		const years = season.name.match(/^(\d{4})\s*[-–]\s*\d{2}(\d{2})$/);
		return years ? `${years[1]}–${years[2]} Season` : season.name;
	});

	const currentWeek = $derived(nextGame?.weekNumber ?? null);
	const totalWeeks = $derived(season?.totalWeeks ?? null);
	const progress = $derived(
		currentWeek && totalWeeks ? Math.min(100, (currentWeek / totalWeeks) * 100) : 0
	);
	const nextGameDate = $derived(nextGame ? new Date(nextGame.startDate) : null);
</script>

{#snippet rinkMarkings(className: string)}
	<svg
		aria-hidden="true"
		class={['pointer-events-none', className]}
		viewBox="0 0 400 240"
		preserveAspectRatio="xMidYMid slice"
	>
		<line x1="118" y1="0" x2="118" y2="240" stroke="#2a62e0" stroke-width="6" opacity="0.22" />
		<line x1="282" y1="0" x2="282" y2="240" stroke="#2a62e0" stroke-width="6" opacity="0.22" />
		<line x1="200" y1="0" x2="200" y2="240" stroke="#c8102e" stroke-width="3" opacity="0.3" />
		<circle
			cx="200"
			cy="120"
			r="78"
			fill="none"
			stroke="#c8102e"
			stroke-width="1.5"
			opacity="0.3"
		/>
		<circle cx="200" cy="120" r="3.5" fill="#c8102e" opacity="0.4" />
	</svg>
{/snippet}

<section
	class="relative isolate flex overflow-hidden rounded-2xl border bg-card px-5 py-7 text-card-foreground md:items-center md:gap-10 md:px-10 md:py-12"
>
	<!-- Mobile: centre ice sits faded behind the copy -->
	{@render rinkMarkings('absolute inset-0 -z-10 size-full md:hidden')}
	<div
		aria-hidden="true"
		class="absolute inset-0 -z-10 bg-linear-to-b from-card/40 via-card/85 to-card md:hidden"
	></div>

	<div class="flex max-w-xl flex-col gap-5">
		{#if seasonLabel || currentWeek}
			<div class="flex flex-col gap-2">
				<p
					class="flex flex-wrap items-center gap-x-2 text-xs font-semibold tracking-widest uppercase"
				>
					{#if seasonLabel}
						<span class="text-muted-foreground">{seasonLabel}</span>
					{/if}
					{#if seasonLabel && currentWeek}
						<span class="size-1 rounded-full bg-muted-foreground/60"></span>
					{/if}
					{#if currentWeek}
						<span class="text-primary-foreground">
							Week {currentWeek}{#if totalWeeks}<span class="text-muted-foreground">
									&nbsp;of {totalWeeks}</span
								>{/if}
						</span>
					{/if}
				</p>
				{#if progress}
					<div
						class="h-1 w-40 overflow-hidden rounded-full bg-muted"
						role="progressbar"
						aria-label="Season progress"
						aria-valuemin={0}
						aria-valuemax={totalWeeks}
						aria-valuenow={currentWeek}
					>
						<div class="h-full rounded-full bg-[#c8102e]" style:width="{progress}%"></div>
					</div>
				{/if}
			</div>
		{/if}

		<div class="flex flex-col gap-3">
			<h1
				class="text-[2rem] leading-[1.05] font-bold tracking-tight text-balance text-primary-foreground md:text-5xl"
			>
				Men's Tuesday night hockey in Niagara-on-the-Lake.
			</h1>
			<p class="max-w-md text-sm text-pretty text-muted-foreground md:text-base">
				Four teams, two games every Tuesday night from September through March. Scores, schedules
				and standings all live here.
			</p>
		</div>

		{#if nextGameDate}
			<a
				href="#upcoming-games"
				class="group flex w-fit items-center gap-3 rounded border bg-background/40 py-2 ps-3 pe-4 backdrop-blur-sm transition-colors hover:bg-muted/60"
			>
				<span class="relative flex size-2.5">
					<span
						class="absolute inline-flex size-full rounded-full bg-primary/60 motion-safe:animate-ping"
					></span>
					<span class="relative inline-flex size-2.5 rounded-full bg-primary"></span>
				</span>
				<span class="flex flex-col leading-tight">
					<span class="text-[0.7rem] tracking-wider text-muted-foreground uppercase">
						Next puck drop
					</span>
					<span class="text-sm font-semibold text-primary-foreground">
						{dateFormat.format(nextGameDate)} · {timeFormat.format(nextGameDate)}
					</span>
				</span>
				<ArrowDown
					class="ms-1 size-4 text-muted-foreground transition-transform group-hover:translate-y-0.5"
				/>
			</a>
		{/if}

		{#if teamNames.length}
			<ul class="flex items-center gap-4 md:hidden" aria-label="Teams">
				{#each teamNames as name (name)}
					{@const glow = teamColours[name as TeamName]?.glow}
					<li class="hero-logo" title={name} style:--glow={glow?.[0] ?? 'transparent'}>
						<Logo name={name as TeamName} className="size-9 md:size-10" />
					</li>
				{/each}
			</ul>
		{/if}
	</div>

	<!-- Desktop: centre ice with the league's teams inside the faceoff circle -->
	{#if teamNames.length}
		<div class="relative -my-12 hidden flex-1 items-center justify-center self-stretch md:flex">
			{@render rinkMarkings('absolute inset-0 -z-10 size-full')}
			<ul class="grid grid-cols-2 gap-x-8 gap-y-6 py-12" aria-label="Teams">
				{#each teamNames as name (name)}
					{@const glow = teamColours[name as TeamName]?.glow}
					<li class="hero-logo" title={name} style:--glow={glow?.[0] ?? 'transparent'}>
						<Logo name={name as TeamName} className="size-16 lg:size-20" />
					</li>
				{/each}
			</ul>
		</div>
	{/if}
</section>

<style>
	/* Same outline-following glow as the game cards, a touch softer */
	.hero-logo :global(svg) {
		filter: drop-shadow(0 0 3px color-mix(in oklab, var(--glow) 35%, transparent))
			drop-shadow(0 0 10px color-mix(in oklab, var(--glow) 20%, transparent));
	}
</style>
