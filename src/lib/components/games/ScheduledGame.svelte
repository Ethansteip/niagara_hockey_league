<script>
  import { Card, CardContent, CardHeader, CardTitle } from "$lib/components/ui/card";
  import { Badge } from "$lib/components/ui/badge";
  import Button from "$lib/components/ui/button/button.svelte";
  import { Avatar, AvatarFallback, AvatarImage } from "$lib/components/ui/avatar";
  import { Separator } from "$lib/components/ui/separator";
  import { formatGameTime } from "$lib/utils";
  import { getTeamInitials } from "$lib/utils";
  import { ChevronRight, Calendar } from "@lucide/svelte";

  let { 
    weekNumber, 
    id,
    status, 
    homeTeamLogoUrl, 
    homeTeamName, 
    awayTeamLogoUrl, 
    awayTeamName ,
    homeTeamInitials,
    awayTeamInitials,
    startsAt,
    homeTeamStandings = null,
    awayTeamStandings = null
  } = $props();
</script>

<Card class="overflow-hidden hover:shadow-lg transition-all duration-200 border-border">
  <CardHeader class="pb-3">
    <div class="flex items-center justify-between">
      <CardTitle class="text-lg font-semibold text-foreground">
        Week #{weekNumber}
      </CardTitle>
      <Badge variant="secondary">
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    </div>
  </CardHeader>
  
  <CardContent class="pt-0">
    <!-- Teams Section -->
    <div class="flex items-center justify-between mb-4">
      <!-- Home Team -->
      <div class="flex items-center space-x-3 flex-1">
        <Avatar class="w-13 h-13 ring-2 ring-ring p-1">
          <AvatarImage src={homeTeamLogoUrl} alt={homeTeamName} />
          <AvatarFallback class="bg-muted text-card-foreground font-semibold">
            {getTeamInitials(homeTeamInitials)}
          </AvatarFallback>
        </Avatar>
        <div class="w-auto  flex flex-col justify-center items-center">
          <h3 class="font-semibold text-foreground truncate">{homeTeamName}</h3>
          {#if homeTeamStandings}
            <p class="text-xs text-muted-foreground tracking-wider">{homeTeamStandings.wins}-{homeTeamStandings.losses}-{homeTeamStandings.ties}</p>
          {/if}
        </div>
      </div>

      <!-- VS Divider -->
      <div class="flex flex-col items-center mx-4">
        <div class="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
          <span class="text-xs font-bold text-muted-foreground">VS</span>
        </div>
      </div>

      <!-- Away Team -->
      <div class="flex items-center space-x-3 flex-1 justify-end">
        <div class="w-auto  flex flex-col justify-center items-center">
          <h3 class="font-semibold text-foreground truncate">{awayTeamName}</h3>
          {#if awayTeamStandings}
            <p class="text-xs text-muted-foreground tracking-wider">{awayTeamStandings.wins}-{awayTeamStandings.losses}-{awayTeamStandings.ties}</p>
          {/if}
        </div>
        <Avatar class="w-13 h-13 ring-2 ring-ring p-1">
          <AvatarImage src={awayTeamLogoUrl} alt={awayTeamName} />
          <AvatarFallback class="bg-muted text-card-foreground font-semibold">
            {getTeamInitials(awayTeamInitials)}
          </AvatarFallback>
        </Avatar>
      </div>
    </div>

    <Separator class="my-4" />

    <!-- Game Details -->
    <div class="flex items-center justify-between text-sm">
      <div class="flex items-center space-x-2 text-muted-foreground">
        <Calendar class="w-5 h-5" />
        <span class="font-medium">{formatGameTime(startsAt)}</span>
      </div>
      <Button variant="ghost" size="icon" href="/games/{id}">
        <ChevronRight class="w-5 h-5" />
      </Button>
    </div>
  </CardContent>
</Card>