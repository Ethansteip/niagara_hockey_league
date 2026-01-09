<script lang="ts">
 import { Button } from "$lib/components/ui/button/index.js";
 import * as Card from "$lib/components/ui/card/index.js";
 import { getStandings } from "$lib/api/standings.remote";
 import { Avatar, AvatarFallback, AvatarImage } from "$lib/components/ui/avatar";
 import { cn, getTeamInitials } from "$lib/utils";

 const standings = $derived(await getStandings());

 function getRankDisplay(index: number) {
   switch(index) {
     case 0: return "1st";
     case 1: return "2nd";
     case 2: return "3rd";
     case 3: return "4th";
     default: return `${index + 1}th`;
   }
 }

 const getStandingStyles = (index: number) => {
  switch(index) {
    case 0: return "ring-2 ring-primary bg-linear-to-br from-primary/20 to-transparent";
    case 1: return "ring-2 ring-zinc-300/30 bg-linear-to-br from-zinc-300/20 to-transparent"
    case 2: return "ring-2 ring-amber-500/30 bg-linear-to-br from-amber-500/20 to-transparent"
    default: return ""
  }
 }
</script>

<div class="text-left mb-5">
  <h1 class="text-3xl font-bold text-foreground mb-2">Standings</h1>
</div>

<Card.Root class="w-full">
 <Card.Content class="w-full flex flex-col gap-3 p-6">
  {#each standings as standing, i}
    <div class={cn("overflow-hidden rounded-lg border border-border bg-card p-4 transition-all hover:shadow-lg", getStandingStyles(i))}>

      <div class="flex items-center justify-between relative z-10">
        <!-- Left: Rank & Team -->
        <div class="flex items-center gap-4">
          <!-- Rank Badge -->
          <div class="flex h-12 w-12 items-center justify-center rounded-full shrink-0 bg-muted text-foreground {i === 0 ? ' ring-2 ring-primary' : ''} {i === 1 ? ' ring-2 ring-zinc-300/30' : ''} {i === 2 ? ' ring-2 ring-amber-500/30' : ''}">
              <span class="text-xl font-bold">{i + 1}</span>
          </div>

          <!-- Team Avatar -->
          <Avatar class="h-14 w-14 shrink-0">
            <AvatarImage src={standing?.teams?.logoUrl} alt={standing?.teams?.name} />
            <AvatarFallback class="bg-muted text-card-foreground font-semibold">
              {getTeamInitials(standing?.teams?.name)}
            </AvatarFallback>
          </Avatar>

          <!-- Team Info -->
          <div class="min-w-0 shrink-0 flex flex-col items-center">
            <h3 class="font-bold text-foreground truncate">{standing?.teams?.name}</h3>
            <p class="text-sm text-muted-foreground">
              {standing?.team_standings?.wins}-{standing?.team_standings?.losses}-{standing?.team_standings?.ties}
            </p>
          </div>
        </div>

        <!-- Right: Points -->
        <div class="text-right shrink-0 flex flex-col items-center">
          <div class="text-3xl font-bold text-foreground">{standing?.team_standings?.points}</div>
          <div class="text-xs text-muted-foreground uppercase tracking-wide">Points</div>
        </div>
      </div>
    </div>
  {/each}
 </Card.Content>
 <!-- <Card.Footer class="flex-col gap-2">
  <Button variant="outline" class="w-full" href="/standings">View Full Standings</Button>
 </Card.Footer> -->
</Card.Root>