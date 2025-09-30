<script>
  import { Card, CardContent, CardHeader, CardTitle } from "$lib/components/ui/card";
  import { Separator } from "$lib/components/ui/separator";
  import { Badge } from "$lib/components/ui/badge";
  import { Avatar, AvatarFallback, AvatarImage } from "$lib/components/ui/avatar";
  import Button from "$lib/components/ui/button/button.svelte";
  import { formatGameTime } from "$lib/utils";
  import { getTeamInitials } from "$lib/utils";
  import { ChevronRight, Calendar } from "@lucide/svelte";

  let { 
    weekNumber, 
    id,
    status,
    decidedIn,
    homeTeamLogoUrl, 
    homeTeamName,
    homeScore, 
    awayTeamLogoUrl, 
    awayTeamName,
    awayScore,
    homeTeamInitials,
    awayTeamInitials,
    startsAt,
    homeTeamStandings = null,
    awayTeamStandings = null
  } = $props();
</script>

<a href="/games/{id}">
<Card class="mb-4 sm:mb-6 border-slate-200">
  <CardHeader class="">
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <CardTitle class="font-bold text-slate-900 mb-2 flex items-center justify-between w-full">
          <div class="flex items-center gap-2 text-slate-600">
            <Calendar class="w-4 h-4" />
            <span class="font-medium">{formatGameTime(startsAt.toString())}</span>
          </div>
          <Badge variant="default">
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        </CardTitle>
    </div>
  </CardHeader>
  
  <CardContent class="pt-0">
    <!-- Teams Matchup -->
    <div class="flex items-center justify-between">
      <!-- Home Team -->
      <div class="flex flex-col items-center justify-center">
        <Avatar class="w-20 h-20">
          <AvatarImage src={homeTeamLogoUrl} alt={homeTeamName} />
          <AvatarFallback class="bg-slate-100 text-slate-700 font-semibold text-sm sm:text-lg">
            {getTeamInitials(homeTeamName)}
          </AvatarFallback>
        </Avatar>
        <div class="flex flex-col min-w-0">
          <h3 class="font-bold text-sm sm:text-lg lg:text-xl text-slate-900 truncate">{homeTeamName}</h3>
        </div>
      </div>

      <!-- Score or VS -->
      <div class="flex flex-col items-center mx-2 sm:mx-4 flex-shrink-0">
          <div class="text-center">
            <div class="text-4xl font-bold text-slate-900">
              {homeScore} - {awayScore}
            </div>
            {#if decidedIn}
              <p class="text-xs text-slate-500 mt-1">
                {decidedIn === 'overtime' ? 'OT' : 
                 decidedIn === 'shootout' ? 'SO' : 
                 'Regulation'}
              </p>
            {/if}
          </div>
      </div>

      <!-- Away Team -->
      <div class="flex flex-col items-center justify-center">
        <Avatar class="w-20 h-20">
          <AvatarImage src={awayTeamLogoUrl} alt={awayTeamName} />
          <AvatarFallback class="bg-slate-100 text-slate-700 font-semibold text-sm sm:text-lg">
            {getTeamInitials(awayTeamName)}
          </AvatarFallback>
        </Avatar>
        <div class="flex flex-col min-w-0">
          <h3 class="font-bold text-sm sm:text-lg lg:text-xl text-slate-900 truncate">{awayTeamName}</h3>
        </div>
      </div>
    </div>
  </CardContent>
</Card>
</a>