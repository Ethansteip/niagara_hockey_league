<script lang="ts">
  import PlayerStats from "$lib/components/layout/web/PlayerStats.svelte";
</script>

<div class="min-h-screen bg-background">
  <div class="container mx-auto px-4 max-w-4xl">
    <PlayerStats limit={undefined} hideLink={true}/>
  </div>
</div>