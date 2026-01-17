<script lang="ts">
  import * as Table from "$lib/components/ui/table/index.js";
  import Button from "$lib/components/ui/button/button.svelte";
  import { getPlayerStats } from "$lib/api/player-stats.remote";

  type Props = {
    limit: number | undefined;
    hideLink: boolean;
  };

  let { limit, hideLink = false }: Props = $props();

  const stats = $derived(await getPlayerStats());
  const limitedStats = $derived(stats.slice(0, limit));

  const finalStats = $derived(limit ? limitedStats : stats);
</script>

<div class="text-left mt-8">
  <h1 class="text-3xl font-bold text-foreground mb-2">Player Stats</h1>
</div>
<Table.Root>
  <Table.Header>
    <Table.Row>
      <Table.Head class="w-25">Name</Table.Head>
      <Table.Head>Goals</Table.Head>
      <Table.Head>Assists</Table.Head>
      <Table.Head class="hidden lg:block">Penalty Mins.</Table.Head>
      <Table.Head class="text-end font-bold">Points</Table.Head>
    </Table.Row>
  </Table.Header>
  <Table.Body>
    {#each finalStats as stat}
      <Table.Row>
        <Table.Cell class="font-medium">{stat.firstName} {stat.lastName}</Table.Cell>
        <Table.Cell>{stat.goals}</Table.Cell>
        <Table.Cell>{stat.assists}</Table.Cell>
        <Table.Cell class="hidden lg:flex">{stat.pims}</Table.Cell>
        <Table.Cell class="text-end font-bold text-primary/90">{stat.points}</Table.Cell>
      </Table.Row>
    {/each}
  </Table.Body>
</Table.Root>

{#if !hideLink}
  <div class="flex w-full justify-end ">
    <Button variant="link" href="/player-stats" class="p-0">View All Stats</Button>
  </div>
{/if}