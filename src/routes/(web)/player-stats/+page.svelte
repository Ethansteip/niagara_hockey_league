<script lang="ts">
  import PlayerStats from "$lib/components/layout/web/Player-Stats/data-table.svelte";
  import { getPlayerStats } from "$lib/api/player-stats.remote";
  import { createColumns } from "$lib/components/layout/web/Player-Stats/columns";

  const stats = $derived(await getPlayerStats());
  const columns = createColumns({ hidePointsSort: false });
</script>

<div class="min-h-screen bg-background">
  <div class="container mx-auto px-4 max-w-4xl">
    <PlayerStats data={stats} hideLink={true} {columns}/>
  </div>
</div>