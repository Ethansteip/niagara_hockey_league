<script lang="ts">
  let { data } = $props();
  let { games } = $derived(data);
</script>

<section class="w-full h-full flex flex-col items-center justify-center gap-3">
	{#each games as game}
		<div>
			<h1>{game.games.id}</h1>
			<h1>{game.teams.name}</h1>
			<h1>{game.games.startsAt}</h1>
			<h1>{game.games.status}</h1>
		</div>
	{/each}
</section>