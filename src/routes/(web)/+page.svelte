<script lang="ts">
  import ScheduledGame from "$lib/components/games/ScheduledGame.svelte";
  import { Card, CardContent } from "$lib/components/ui/card";
  import Button from "$lib/components/ui/button/button.svelte";
  import Standings from "$lib/components/layout/web/Standings.svelte";
  import Playoffs from "$lib/components/layout/web/Playoffs.svelte";
  import PlayerStats from "$lib/components/layout/web/Player-Stats/data-table.svelte";
  import { createColumns } from "$lib/components/layout/web/Player-Stats/columns.js";
  import { getPlayerStats } from "$lib/api/player-stats.remote";

  // let { data } = $props();
  // let { games } = $derived(data);
  // let { stats, lastUpdated } = $derived(await getPlayerStats());
  // let limitedStats = $derived(stats.slice(0, 10));
  // const columns = createColumns({ hidePointsSort: true });
</script>

<div class="h-screen bg-background flex flex-col items-center justify-center">
  <p class="text-sm italic">Tuesday night hockey</p>
  <p class="text-2xl font-bold">We'll Be Back in the Fall!</p>
</div>