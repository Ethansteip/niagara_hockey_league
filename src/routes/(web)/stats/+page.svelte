<script lang="ts">
	import { getPlayerStats } from '$lib/remote/stats/stats.remote';
	import PlayerStatsTable from '$lib/components/stats/PlayerStatsTable.svelte';

	const playerStats = $derived(await getPlayerStats({}));
</script>

<section class="flex w-full flex-col gap-4">
	<h1 class="text-[1.5rem] font-bold text-primary-foreground md:text-2xl">Player Stats</h1>
	<div class="rounded-2xl border bg-card p-3 text-card-foreground shadow-sm">
		<PlayerStatsTable data={playerStats} />
	</div>
</section>
