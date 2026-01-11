<script lang="ts">
  import { Card, CardContent } from "$lib/components/ui/card"
  import { ArrowLeft } from "@lucide/svelte";
  import Button from "$lib/components/ui/button/button.svelte";
  import ScheduledGame from "$lib/components/games/ScheduledGame.svelte";

  let { data } = $props();
  let { games } = $derived(data);
</script>

<div class="min-h-screen bg-background">
  <div class="container mx-auto px-4 py-8 max-w-4xl">
    <!-- Header Section -->
    <div class="flex items-center justify-between mb-5">
      <h1 class="text-3xl font-bold text-foreground mb-2">All Upcoming Games</h1>
      <Button variant="outline" href="/">
        <ArrowLeft class="w-4 h-4" />
      </Button>
    </div>

    <!-- Games Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
      {#each games as game}
        <ScheduledGame
          id={game.id}
          weekNumber={game.weekNumber}
          status={game.status}
          homeTeamLogoUrl={game.homeTeamLogoUrl}
          homeTeamName={game.homeTeamName}
          awayTeamLogoUrl={game.awayTeamLogoUrl}
          awayTeamName={game.awayTeamName}
          homeTeamInitials={game.homeTeamName}
          awayTeamInitials={game.awayTeamName}
          homeTeamStandings={game.homeTeamStandings}
          awayTeamStandings={game.awayTeamStandings}
          startsAt={game.startsAt.toString()}
        />
      {/each}
    </div>

    <!-- Empty State -->
    {#if games.length === 0}
      <Card class="text-center py-12">
        <CardContent>
          <div class="flex flex-col items-center space-y-4">
            <div class="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
              <svg class="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
              </svg>
            </div>
            <div>
              <h3 class="text-lg font-semibold text-foreground mb-2">No Upcoming Games</h3>
              <p class="text-muted-foreground">Check back later for the latest schedule updates.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    {/if}
  </div>
</div>