<script lang="ts">
	import { LineChart } from 'layerchart';
	import { scaleLinear } from 'd3-scale';
	import { curveStep } from 'd3-shape';
	import { MediaQuery } from 'svelte/reactivity';
	import * as Chart from '$lib/components/ui/chart/index.js';
	import Logo, { type TeamName } from '$lib/components/layout/assets/Logo.svelte';
	import { teamColours } from '$lib/components/layout/assets/team-colours';
	import type {
		PointsProgression,
		PointsProgressionWeek
	} from '$lib/remote/standings/standings.remote';

	type Props = {
		data: PointsProgression;
		/* Number of most recent weeks shown on small screens */
		mobileWeeks?: number;
		class?: string;
	};

	let { data, mobileWeeks = 10, class: className }: Props = $props();

	const LOGO_SIZE = 22;
	const FALLBACK_COLOUR = 'var(--muted-foreground)';

	const isMobile = new MediaQuery('(max-width: 767px)');
	let selectedTeamId = $state<number | null>(null);

	const colourFor = (name: string) => teamColours[name as TeamName]?.line ?? FALLBACK_COLOUR;
	const seriesKey = (teamId: number) => `team-${teamId}`;

	// Only the week 0 baseline means no games have been played yet
	const hasResults = $derived(data.weeks.length > 1);
	const visibleWeeks = $derived(isMobile.current ? data.weeks.slice(-mobileWeeks) : data.weeks);
	const maxPoints = $derived(
		Math.max(0, ...visibleWeeks.flatMap((week) => Object.values(week.points)))
	);

	const chartConfig = $derived(
		Object.fromEntries(
			data.teams.map((team) => [
				seriesKey(team.id),
				{ label: team.name, color: colourFor(team.name) }
			])
		) satisfies Chart.ChartConfig
	);

	// The selected team is drawn last so its line sits on top of the others
	const series = $derived(
		data.teams
			.toSorted((a, b) => Number(a.id === selectedTeamId) - Number(b.id === selectedTeamId))
			.map((team) => {
				const isSelected = team.id === selectedTeamId;
				const isMuted = selectedTeamId !== null && !isSelected;
				return {
					key: seriesKey(team.id),
					label: team.name,
					value: (week: PointsProgressionWeek) => week.points[team.id] ?? 0,
					color: colourFor(team.name),
					props: {
						strokeWidth: isSelected ? 3 : 2,
						// opacity is overridden by Chart.Container's CSS; stroke-opacity is not
						strokeOpacity: isMuted ? 0.2 : 1,
						class: 'transition-[stroke-opacity,stroke-width] duration-200'
					}
				};
			})
	);

	type LogoMarker = { id: number; name: string; x: number; y: number; lineY: number };

	/*
	 * Places a logo on the last step of each line. Teams on equal (or close) points
	 * would stack their logos on top of each other, so overlapping logos are grouped
	 * and fanned out vertically around the group's centre, then clamped to the plot.
	 */
	function logoMarkers(
		xScale: (week: number) => number,
		yScale: (points: number) => number,
		height: number
	): LogoMarker[] {
		const last = visibleWeeks.at(-1);
		if (!last) return [];

		const gap = LOGO_SIZE + 2;
		const markers = data.teams
			.map((team) => {
				const lineY = yScale(last.points[team.id] ?? 0);
				return { id: team.id, name: team.name, x: xScale(last.week), y: lineY, lineY };
			})
			.sort((a, b) => a.lineY - b.lineY);

		const top = (group: LogoMarker[]) => group[0].y;
		const bottom = (group: LogoMarker[]) => group.at(-1)!.y;
		const layOut = (group: LogoMarker[]) => {
			const centre = group.reduce((total, m) => total + m.lineY, 0) / group.length;
			// Keep badges inside the plot so they never cover the x axis labels
			const start = Math.min(
				Math.max(centre - ((group.length - 1) * gap) / 2, 0),
				height - LOGO_SIZE / 2 - (group.length - 1) * gap
			);
			group.forEach((m, i) => (m.y = start + i * gap));
		};

		const groups: LogoMarker[][] = markers.map((marker) => [marker]);
		groups.forEach(layOut);

		let merged = true;
		while (merged) {
			merged = false;
			for (let i = 1; i < groups.length; i++) {
				if (top(groups[i]) - bottom(groups[i - 1]) < gap) {
					groups[i - 1] = [...groups[i - 1], ...groups[i]];
					groups.splice(i, 1);
					layOut(groups[i - 1]);
					merged = true;
					break;
				}
			}
		}

		return groups.flat();
	}

	function toggleTeam(teamId: number) {
		selectedTeamId = selectedTeamId === teamId ? null : teamId;
	}
</script>

<div class={['flex flex-col gap-3', className]}>
	{#if hasResults}
		<Chart.Container config={chartConfig} class="aspect-auto h-56 w-full md:h-72">
			<LineChart
				data={visibleWeeks}
				x="week"
				xScale={scaleLinear()}
				xDomain={[visibleWeeks[0].week, visibleWeeks.at(-1)!.week]}
				yDomain={[0, Math.max(4, maxPoints)]}
				yNice
				{series}
				seriesLayout="overlap"
				padding={{ top: LOGO_SIZE / 2 + 2, right: LOGO_SIZE / 2 + 4, bottom: 20, left: 24 }}
				props={{
					spline: { curve: curveStep, motion: 'tween' },
					xAxis: {
						ticks: visibleWeeks.map((week) => week.week),
						format: (week: number) => (week === 0 ? '' : `W${week}`)
					},
					yAxis: {
						ticks: 4,
						format: (value: number) => (Number.isInteger(value) ? `${value}` : '')
					},
					highlight: { points: { r: 3 } }
				}}
			>
				{#snippet aboveMarks({ context })}
					{#each logoMarkers(context.xScale, context.yScale, context.height) as marker (marker.id)}
						{@const muted = selectedTeamId !== null && marker.id !== selectedTeamId}
						<g
							class="pointer-events-none transition-opacity duration-200"
							opacity={muted ? 0.35 : 1}
						>
							{#if Math.abs(marker.y - marker.lineY) > 1}
								<line
									x1={marker.x}
									y1={marker.lineY}
									x2={marker.x}
									y2={marker.y}
									stroke={colourFor(marker.name)}
									stroke-width="1.5"
									stroke-dasharray="2 2"
								/>
							{/if}
							<circle
								cx={marker.x}
								cy={marker.y}
								r={LOGO_SIZE / 2 + 1}
								fill="var(--card)"
								stroke={colourFor(marker.name)}
								stroke-width="1.5"
							/>
							<g
								transform="translate({marker.x - LOGO_SIZE / 2 + 3}, {marker.y -
									LOGO_SIZE / 2 +
									3})"
							>
								<Logo name={marker.name as TeamName} size={LOGO_SIZE - 6} />
							</g>
						</g>
					{/each}
				{/snippet}
				{#snippet tooltip()}
					<Chart.Tooltip labelFormatter={(week: number) => (week === 0 ? 'Start' : `Week ${week}`)} />
				{/snippet}
			</LineChart>
		</Chart.Container>
	{:else}
		<div
			class="flex h-40 flex-col items-center justify-center gap-1 rounded-xl border border-dashed text-center md:h-56"
		>
			<p class="text-sm font-semibold text-card-foreground">No points yet</p>
			<p class="text-xs text-muted-foreground">Standings will fill in after the first game night.</p>
		</div>
	{/if}

	{#if data.teams.length}
		<div class="grid grid-cols-2 gap-2 sm:grid-cols-4">
			{#each data.teams as team (team.id)}
				{@const isSelected = team.id === selectedTeamId}
				{@const isMuted = selectedTeamId !== null && !isSelected}
				<button
					type="button"
					aria-pressed={isSelected}
					disabled={!hasResults}
					onclick={() => toggleTeam(team.id)}
					style:--team={colourFor(team.name)}
					class={[
						'flex items-center gap-2 rounded-xl border px-2.5 py-2 text-left transition-[opacity,background-color,border-color] duration-200 disabled:cursor-default',
						isSelected
							? 'border-(--team) bg-[color-mix(in_oklab,var(--team)_14%,transparent)]'
							: 'border-border hover:bg-muted/50',
						isMuted && 'opacity-50'
					]}
				>
					<span class="size-2 shrink-0 rounded-full bg-(--team)"></span>
					<Logo name={team.name as TeamName} className="size-6 shrink-0" />
					<span class="min-w-0 flex-1 truncate text-sm font-semibold">{team.name}</span>
					<span class="text-xs text-muted-foreground tabular-nums">{team.points} pts</span>
				</button>
			{/each}
		</div>
	{/if}
</div>
