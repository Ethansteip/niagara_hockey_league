<script lang="ts">
  import { Card, CardContent, CardHeader, CardTitle } from "$lib/components/ui/card";
  import { Badge } from "$lib/components/ui/badge";
  import Button from "$lib/components/ui/button/button.svelte";
  import { Avatar, AvatarFallback, AvatarImage } from "$lib/components/ui/avatar";
  import { Separator } from "$lib/components/ui/separator";
  import { formatGameTime } from "$lib/utils";
  import { getTeamInitials } from "$lib/utils";
  import { ArrowLeft, Calendar, MapPin, Trophy, ChartLine } from "@lucide/svelte";

  let { data } = $props();
  let { game } = $derived(data);

  // Helper function to format record
  function formatRecord(standings: any) {
    return `${standings.wins}-${standings.losses}-${standings.ties}`;
  }

  // Helper function to calculate goal differential
  function getGoalDifferential(standings: any) {
    return standings.goalsFor - standings.goalsAgainst;
  }

  // Helper function to format goal differential with sign
  function formatGoalDifferential(standings: any) {
    const diff = getGoalDifferential(standings);
    return diff >= 0 ? `+${diff}` : `${diff}`;
  }
</script>

<div class="min-h-screen bg-gradient-to-br from-slate-100 to-slate-100">
  <div class="container mx-auto px-3 sm:px-4 py-4 sm:py-6 max-w-4xl">
    <!-- Header Section -->
    <div class="flex items-center justify-between mb-4 sm:mb-2">
      <h1 class="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 ml-2">Week #{game.weekNumber}</h1>
      <Button variant="outline" size="sm" href="/games">
        <ArrowLeft class="w-4 h-4" />
      </Button>
    </div>
    <!-- Game Header Card -->
    <Card class="mb-4 sm:mb-6 border-slate-200">
      <CardHeader class="">
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CardTitle class="font-bold text-slate-900 mb-2 flex items-center justify-between w-full">
              <div class="flex items-center gap-2 text-slate-600">
                <Calendar class="w-4 h-4" />
                <span class="font-medium">{formatGameTime(game.startsAt.toString())}</span>
              </div>
              {#if game.status !== 'final'}
              <Badge variant="secondary" class="hidden sm:flex">
                {game.status.charAt(0).toUpperCase() + game.status.slice(1)}
              </Badge>
              {:else}
              <Badge variant="default">
                {game.status.charAt(0).toUpperCase() + game.status.slice(1)}
              </Badge>
              {/if}
            </CardTitle>
        </div>
      </CardHeader>
      
      <CardContent class="pt-0">
        <!-- Teams Matchup -->
        <div class="flex items-center justify-between">
          <!-- Home Team -->
          <div class="flex flex-col items-center justify-center space-x-2 sm:space-x-3">
            <Avatar class="w-20 h-20">
              <AvatarImage src={game.homeTeamLogoUrl} alt={game.homeTeamName} />
              <AvatarFallback class="bg-slate-100 text-slate-700 font-semibold text-sm sm:text-lg">
                {getTeamInitials(game.homeTeamName)}
              </AvatarFallback>
            </Avatar>
            <div class="flex flex-col min-w-0">
              <h3 class="font-bold text-sm sm:text-lg lg:text-xl text-slate-900 truncate">{game.homeTeamName}</h3>
            </div>
          </div>

          <!-- Score or VS -->
          <div class="flex flex-col items-center mx-2 sm:mx-4 flex-shrink-0">
            {#if game.status === 'final'}
              <div class="text-center">
                <div class="text-4xl font-bold text-slate-900">
                  {game.homeScore} - {game.awayScore}
                </div>
                {#if game.decidedIn}
                  <p class="text-xs text-slate-500 mt-1">
                    {game.decidedIn === 'overtime' ? 'OT' : 
                     game.decidedIn === 'shootout' ? 'SO' : 
                     'Regulation'}
                  </p>
                {/if}
              </div>
            {:else}
              <div class="w-8 h-8 sm:w-12 sm:h-12 lg:w-16 lg:h-16 rounded-full bg-slate-100 flex items-center justify-center">
                <span class="text-3xl font-bold">VS</span>
              </div>
            {/if}
          </div>

          <!-- Away Team -->
          <div class="flex flex-col items-center justify-center space-x-2 sm:space-x-3">
            <Avatar class="w-20 h-20">
              <AvatarImage src={game.awayTeamLogoUrl} alt={game.awayTeamName} />
              <AvatarFallback class="bg-slate-100 text-slate-700 font-semibold text-sm sm:text-lg">
                {getTeamInitials(game.awayTeamName)}
              </AvatarFallback>
            </Avatar>
            <div class="flex flex-col min-w-0">
              <h3 class="font-bold text-sm sm:text-lg lg:text-xl text-slate-900 truncate">{game.awayTeamName}</h3>
            </div>
          </div>
        </div>

        <!-- Arena Info -->
        {#if game.arenaName}
          <Separator class="my-4" />
          <div class="flex items-center gap-2 text-slate-600">
            <MapPin class="w-4 h-4" />
            <span class="font-medium">{game.arenaName}</span>
            {#if game.arenaCity && game.arenaProvince}
              <span class="text-slate-500">•</span>
              <span class="text-sm">{game.arenaCity}, {game.arenaProvince}</span>
            {/if}
          </div>
        {/if}
      </CardContent>
    </Card>

    <!-- Team Stats Comparison -->
    <Card class="mb-4 sm:mb-6 border-slate-200">
      <CardHeader>
        <CardTitle class="flex items-center gap-2 text-xl">
          <ChartLine class="w-5 h-5" />
          Regular Season Stats
        </CardTitle>
      </CardHeader>
      <CardContent class="space-y-4">
        <!-- Mobile Layout: Stacked Cards -->
        <div class="block sm:hidden space-y-4">
          <!-- Home Team Stats -->
          <div class="bg-slate-50 rounded-lg p-4 border border-slate-200">
            <div class="flex items-center gap-1 mb-4">
              <Avatar class="w-10 h-10">
                <AvatarImage src={game.homeTeamLogoUrl} alt={game.homeTeamName} />
                <AvatarFallback class="text-sm">{getTeamInitials(game.homeTeamName)}</AvatarFallback>
              </Avatar>
              <div>
                <h4 class="font-semibold text-slate-900">{game.homeTeamName}</h4>
              </div>
            </div>
            
            <!-- Key Stats Row -->
            <div class="grid grid-cols-3 gap-3 mb-4">
              <div class="text-center bg-white rounded-lg p-3">
                <div class="text-lg font-bold text-slate-900">{game.homeTeamStandings.points}</div>
                <div class="text-xs text-slate-600">Points</div>
              </div>
              <div class="text-center bg-white rounded-lg p-3">
                <div class="text-lg font-bold text-slate-900">{formatRecord(game.homeTeamStandings)}</div>
                <div class="text-xs text-slate-600">Record</div>
              </div>
              <div class="text-center bg-white rounded-lg p-3">
                <div class="text-lg font-bold {getGoalDifferential(game.homeTeamStandings) >= 0 ? 'text-green-600' : 'text-red-600'}">
                  {formatGoalDifferential(game.homeTeamStandings)}
                </div>
                <div class="text-xs text-slate-600">Goal Diff.</div>
              </div>
            </div>

            <!-- Detailed Stats -->
            <div class="space-y-2 text-sm">
              <div class="flex justify-between py-1">
                <span class="text-slate-600">Goals For:</span>
                <span class="font-medium">{game.homeTeamStandings.goalsFor}</span>
              </div>
              <div class="flex justify-between py-1">
                <span class="text-slate-600">Goals Against:</span>
                <span class="font-medium">{game.homeTeamStandings.goalsAgainst}</span>
              </div>
              <div class="flex justify-between py-1">
                <span class="text-slate-600">Games Played:</span>
                <span class="font-medium">{game.homeTeamStandings.gamesPlayed}</span>
              </div>
            </div>
          </div>

          <!-- Away Team Stats -->
          <div class="bg-slate-50 rounded-lg p-4 border border-slate-200">
            <div class="flex items-center gap-2 mb-4">
              <Avatar class="w-10 h-10">
                <AvatarImage src={game.awayTeamLogoUrl} alt={game.awayTeamName} />
                <AvatarFallback class="text-sm">{getTeamInitials(game.awayTeamName)}</AvatarFallback>
              </Avatar>
              <div>
                <h4 class="font-semibold text-slate-900">{game.awayTeamName}</h4>
              </div>
            </div>
            
            <!-- Key Stats Row -->
            <div class="grid grid-cols-3 gap-3 mb-4">
              <div class="text-center bg-white rounded-lg p-3">
                <div class="text-lg font-bold text-slate-900">{game.awayTeamStandings.points}</div>
                <div class="text-xs text-slate-600">Points</div>
              </div>
              <div class="text-center bg-white rounded-lg p-3">
                <div class="text-lg font-bold text-slate-900">{formatRecord(game.awayTeamStandings)}</div>
                <div class="text-xs text-slate-600">Record</div>
              </div>
              <div class="text-center bg-white rounded-lg p-3">
                <div class="text-lg font-bold {getGoalDifferential(game.awayTeamStandings) >= 0 ? 'text-green-600' : 'text-red-600'}">
                  {formatGoalDifferential(game.awayTeamStandings)}
                </div>
                <div class="text-xs text-slate-600">Goal Diff.</div>
              </div>
            </div>

            <!-- Detailed Stats -->
            <div class="space-y-2 text-sm">
              <div class="flex justify-between py-1">
                <span class="text-slate-600">Goals For:</span>
                <span class="font-medium">{game.awayTeamStandings.goalsFor}</span>
              </div>
              <div class="flex justify-between py-1">
                <span class="text-slate-600">Goals Against:</span>
                <span class="font-medium">{game.awayTeamStandings.goalsAgainst}</span>
              </div>
              <div class="flex justify-between py-1">
                <span class="text-slate-600">Games Played:</span>
                <span class="font-medium">{game.awayTeamStandings.gamesPlayed}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Desktop Layout: Side by Side Cards -->
        <div class="hidden sm:block">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Home Team Stats -->
            <div class="bg-slate-50 rounded-lg p-6 border border-slate-200">
              <div class="flex justify-center items-center gap-3 mb-6">
                <Avatar class="w-12 h-12">
                  <AvatarImage src={game.homeTeamLogoUrl} alt={game.homeTeamName} />
                  <AvatarFallback class="text-sm">{getTeamInitials(game.homeTeamName)}</AvatarFallback>
                </Avatar>
              </div>
              
              <!-- Key Stats Row -->
              <div class="grid grid-cols-3 gap-4 mb-6">
                <div class="text-center bg-white rounded-lg p-4">
                  <div class="text-xl font-bold text-slate-900">{game.homeTeamStandings.points}</div>
                  <div class="text-xs text-slate-600">Points</div>
                </div>
                <div class="text-center bg-white rounded-lg p-4">
                  <div class="text-xl font-bold text-slate-900">{formatRecord(game.homeTeamStandings)}</div>
                  <div class="text-xs text-slate-600">Record</div>
                </div>
                <div class="text-center bg-white rounded-lg p-4">
                  <div class="text-xl font-bold {getGoalDifferential(game.homeTeamStandings) >= 0 ? 'text-green-600' : 'text-red-600'}">
                    {formatGoalDifferential(game.homeTeamStandings)}
                  </div>
                  <div class="text-xs text-slate-600">Diff</div>
                </div>
              </div>

              <!-- Detailed Stats -->
              <div class="space-y-3 text-sm">
                <div class="flex justify-between py-2 border-b border-slate-200">
                  <span class="text-slate-600">Goals For:</span>
                  <span class="font-medium">{game.homeTeamStandings.goalsFor}</span>
                </div>
                <div class="flex justify-between py-2 border-b border-slate-200">
                  <span class="text-slate-600">Goals Against:</span>
                  <span class="font-medium">{game.homeTeamStandings.goalsAgainst}</span>
                </div>
                <div class="flex justify-between py-2 border-b border-slate-200">
                  <span class="text-slate-600">Games Played:</span>
                  <span class="font-medium">{game.homeTeamStandings.gamesPlayed}</span>
                </div>
                <div class="flex justify-between py-2 border-b border-slate-200">
                  <span class="text-slate-600">Wins:</span>
                  <span class="font-medium text-green-600">{game.homeTeamStandings.wins}</span>
                </div>
                <div class="flex justify-between py-2 border-b border-slate-200">
                  <span class="text-slate-600">Losses:</span>
                  <span class="font-medium text-red-600">{game.homeTeamStandings.losses}</span>
                </div>
                {#if game.homeTeamStandings.ties > 0}
                  <div class="flex justify-between py-2 border-b border-slate-200">
                    <span class="text-slate-600">Ties:</span>
                    <span class="font-medium text-slate-600">{game.homeTeamStandings.ties}</span>
                  </div>
                {/if}
                {#if game.homeTeamStandings.overtimeLosses > 0}
                  <div class="flex justify-between py-2">
                    <span class="text-slate-600">OT Losses:</span>
                    <span class="font-medium text-orange-600">{game.homeTeamStandings.overtimeLosses}</span>
                  </div>
                {/if}
              </div>
            </div>

            <!-- Away Team Stats -->
            <div class="bg-slate-50 rounded-lg p-6 border border-slate-200">
              <div class="flex items-center justify-center gap-3 mb-6">
                <Avatar class="w-12 h-12">
                  <AvatarImage src={game.awayTeamLogoUrl} alt={game.awayTeamName} />
                  <AvatarFallback class="text-sm">{getTeamInitials(game.awayTeamName)}</AvatarFallback>
                </Avatar>
              </div>
              
              <!-- Key Stats Row -->
              <div class="grid grid-cols-3 gap-4 mb-6">
                <div class="text-center bg-white rounded-lg p-4">
                  <div class="text-xl font-bold text-slate-900">{game.awayTeamStandings.points}</div>
                  <div class="text-xs text-slate-600">Points</div>
                </div>
                <div class="text-center bg-white rounded-lg p-4">
                  <div class="text-xl font-bold text-slate-900">{formatRecord(game.awayTeamStandings)}</div>
                  <div class="text-xs text-slate-600">Record</div>
                </div>
                <div class="text-center bg-white rounded-lg p-4">
                  <div class="text-xl font-bold {getGoalDifferential(game.awayTeamStandings) >= 0 ? 'text-green-600' : 'text-red-600'}">
                    {formatGoalDifferential(game.awayTeamStandings)}
                  </div>
                  <div class="text-xs text-slate-600">Diff</div>
                </div>
              </div>

              <!-- Detailed Stats -->
              <div class="space-y-3 text-sm">
                <div class="flex justify-between py-2 border-b border-slate-200">
                  <span class="text-slate-600">Goals For:</span>
                  <span class="font-medium">{game.awayTeamStandings.goalsFor}</span>
                </div>
                <div class="flex justify-between py-2 border-b border-slate-200">
                  <span class="text-slate-600">Goals Against:</span>
                  <span class="font-medium">{game.awayTeamStandings.goalsAgainst}</span>
                </div>
                <div class="flex justify-between py-2 border-b border-slate-200">
                  <span class="text-slate-600">Games Played:</span>
                  <span class="font-medium">{game.awayTeamStandings.gamesPlayed}</span>
                </div>
                <div class="flex justify-between py-2 border-b border-slate-200">
                  <span class="text-slate-600">Wins:</span>
                  <span class="font-medium text-green-600">{game.awayTeamStandings.wins}</span>
                </div>
                <div class="flex justify-between py-2 border-b border-slate-200">
                  <span class="text-slate-600">Losses:</span>
                  <span class="font-medium text-red-600">{game.awayTeamStandings.losses}</span>
                </div>
                {#if game.awayTeamStandings.ties > 0}
                  <div class="flex justify-between py-2 border-b border-slate-200">
                    <span class="text-slate-600">Ties:</span>
                    <span class="font-medium text-slate-600">{game.awayTeamStandings.ties}</span>
                  </div>
                {/if}
                {#if game.awayTeamStandings.overtimeLosses > 0}
                  <div class="flex justify-between py-2">
                    <span class="text-slate-600">OT Losses:</span>
                    <span class="font-medium text-orange-600">{game.awayTeamStandings.overtimeLosses}</span>
                  </div>
                {/if}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Game Notes -->
    {#if game.notes}
      <Card class="border-slate-200">
        <CardHeader>
          <CardTitle class="text-lg">Game Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <p class="text-slate-700 whitespace-pre-wrap">{game.notes}</p>
        </CardContent>
      </Card>
    {/if}
  </div>
</div>
