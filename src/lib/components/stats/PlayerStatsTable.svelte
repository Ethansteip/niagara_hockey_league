<script lang="ts">
	import * as Table from '$lib/components/ui/table/index.js';
	import Logo, { type TeamName } from '$lib/components/layout/assets/Logo.svelte';
	import type { PlayerStatsTableData } from '$lib/remote/stats/stats.remote';
	import { TriangleAlert } from '@lucide/svelte';

	let { data }: { data: PlayerStatsTableData } = $props();

	const updatedFormat = new Intl.DateTimeFormat('en-CA', {
		weekday: 'short',
		month: 'short',
		day: 'numeric',
		hour: 'numeric',
		minute: '2-digit',
		timeZone: 'America/Toronto'
	});
</script>

{#if !data.rows.length}
	<div class="flex flex-col items-center justify-center gap-2 py-10 text-center">
		<TriangleAlert class="size-6 text-amber-400" aria-hidden="true" />
		<p class="font-semibold">No player stats recorded...</p>
		<p class="text-sm text-muted-foreground">
			This will be updated soon, once we get everyone's jersey numbers.
		</p>
	</div>
{:else}
	<p
		class="mb-2 flex items-start gap-2 rounded-md border border-amber-400/30 bg-amber-400/10 px-3 py-2 text-xs text-muted-foreground"
		role="note"
	>
		<TriangleAlert class="mt-px size-3.5 shrink-0 text-amber-400" aria-hidden="true" />
		<span>
			<span class="font-semibold text-foreground">Stats are incomplete.</span>
			We're still collecting everyone's jersey numbers, so some goals and assists haven't been recorded
			yet.
		</span>
	</p>
	<Table.Root>
		<Table.Header>
			<Table.Row class="hover:bg-transparent">
				<Table.Head class="w-8 text-right">#</Table.Head>
				<Table.Head>Player</Table.Head>
				<Table.Head class="text-right"><abbr title="Goals" class="no-underline">G</abbr></Table.Head
				>
				<Table.Head class="text-right"
					><abbr title="Assists" class="no-underline">A</abbr></Table.Head
				>
				<Table.Head class="text-right text-foreground"
					><abbr title="Points" class="no-underline">PTS</abbr></Table.Head
				>
				<Table.Head class="text-right"
					><abbr title="Penalty minutes" class="no-underline">PIM</abbr></Table.Head
				>
			</Table.Row>
		</Table.Header>
		<Table.Body>
			{#each data.rows as row, i (row.playerId)}
				<Table.Row>
					<Table.Cell class="text-right text-muted-foreground tabular-nums">{i + 1}</Table.Cell>
					<Table.Cell>
						<div class="flex items-center gap-2">
							{#if row.teamName}
								<Logo name={row.teamName as TeamName} className="size-6 shrink-0" />
							{/if}
							<span class="font-medium">{row.displayName}</span>
							{#if row.teamName}
								<span class="sr-only">({row.teamName})</span>
							{/if}
						</div>
					</Table.Cell>
					<Table.Cell class="text-right tabular-nums">{row.goals}</Table.Cell>
					<Table.Cell class="text-right tabular-nums">{row.assists}</Table.Cell>
					<Table.Cell class="text-right font-bold text-foreground tabular-nums"
						>{row.points}</Table.Cell
					>
					<Table.Cell class="text-right text-muted-foreground tabular-nums"
						>{row.penaltyMinutes}</Table.Cell
					>
				</Table.Row>
			{/each}
		</Table.Body>
	</Table.Root>
{/if}

{#if data.lastUpdated}
	<p class="mt-2 px-2 text-xs text-muted-foreground">
		Last updated
		<time datetime={data.lastUpdated.toISOString()}>{updatedFormat.format(data.lastUpdated)}</time>
	</p>
{/if}
