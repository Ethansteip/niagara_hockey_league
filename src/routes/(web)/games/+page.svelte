<script lang="ts">
  import { Card, CardContent, CardHeader, CardTitle } from "$lib/components/ui/card";
  import { Badge } from "$lib/components/ui/badge";
  import { Avatar, AvatarFallback, AvatarImage } from "$lib/components/ui/avatar";
  import { Separator } from "$lib/components/ui/separator";
  import { ArrowLeft } from "@lucide/svelte";
  import Button from "$lib/components/ui/button/button.svelte";

  let { data } = $props();
  let { games } = $derived(data);

  function formatGameTime(startsAt: string) {
    // The database stores local times but with 'Z' suffix (treating them as UTC)
    // We need to parse them as local times instead
    const utcDate = new Date(startsAt);
    
    // Create a new date using the same year, month, day, hour, minute but in local time
    const localDate = new Date(
      utcDate.getUTCFullYear(),
      utcDate.getUTCMonth(),
      utcDate.getUTCDate(),
      utcDate.getUTCHours(),
      utcDate.getUTCMinutes(),
      utcDate.getUTCSeconds()
    );
    
    const now = new Date();
    const diffInHours = (localDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    // Format the local time
    const options: Intl.DateTimeFormatOptions = { 
      month: 'short', 
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    };
    const formattedDate = localDate.toLocaleString('en-US', options);
    
    // Add relative time
    if (diffInHours < 24 && diffInHours > 0) {
      const hours = Math.floor(diffInHours);
      const minutes = Math.floor((diffInHours - hours) * 60);
      if (hours > 0) {
        return `${formattedDate} (in ${hours}h ${minutes}m)`;
      } else {
        return `${formattedDate} (in ${minutes}m)`;
      }
    }
    
    return formattedDate;
  }

  function getTeamInitials(teamName: string) {
    return teamName
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }
</script>

<div class="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
  <div class="container mx-auto px-4 py-8 max-w-4xl">
    <!-- Header Section -->
    <div class="flex items-center justify-between mb-5">
      <h1 class="text-3xl font-bold text-slate-900 mb-2">All Games</h1>
      <Button variant="outline" href="/">
        <ArrowLeft class="w-4 h-4" />
      </Button>
    </div>

    <!-- Games Grid -->
    <div class="space-y-4">
      {#each games as game}
        <Card class="overflow-hidden hover:shadow-lg transition-all duration-200 border-slate-200">
          <CardHeader class="pb-3">
            <div class="flex items-center justify-between">
              <CardTitle class="text-lg font-semibold text-slate-800">
                Week #{game.weekNumber}
              </CardTitle>
              <Badge variant="default">
                {game.status.charAt(0).toUpperCase() + game.status.slice(1)}
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent class="pt-0">
            <!-- Teams Section -->
            <div class="flex items-center justify-between mb-4">
              <!-- Home Team -->
              <div class="flex items-center space-x-3 flex-1">
                <Avatar class="w-13 h-13 ring-2 ring-slate-300 p-1">
                  <AvatarImage src={game.homeTeamLogoUrl} alt={game.homeTeamName} />
                  <AvatarFallback class="bg-slate-100 text-slate-700 font-semibold">
                    {getTeamInitials(game.homeTeamName)}
                  </AvatarFallback>
                </Avatar>
                <div class="min-w-0 flex-1">
                  <h3 class="font-semibold text-slate-900 truncate">{game.homeTeamName}</h3>
                </div>
              </div>

              <!-- VS Divider -->
              <div class="flex flex-col items-center mx-4">
                <div class="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                  <span class="text-xs font-bold text-slate-600">VS</span>
                </div>
              </div>

              <!-- Away Team -->
              <div class="flex items-center space-x-3 flex-1 justify-end">
                <div class="min-w-0 flex-1 text-right">
                  <h3 class="font-semibold text-slate-900 truncate">{game.awayTeamName}</h3>
                </div>
                <Avatar class="w-13 h-13 ring-2 ring-slate-300 p-1">
                  <AvatarImage src={game.awayTeamLogoUrl} alt={game.awayTeamName} />
                  <AvatarFallback class="bg-slate-100 text-slate-700 font-semibold">
                    {getTeamInitials(game.awayTeamName)}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>

            <Separator class="my-4" />

            <!-- Game Details -->
            <div class="flex items-center justify-between text-sm">
              <div class="flex items-center space-x-2 text-slate-600">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span class="font-medium">{formatGameTime(game.startsAt.toString())}</span>
              </div>
              
              {#if game.arenaId}
                <div class="flex items-center space-x-2 text-slate-600">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  </svg>
                  <span>Arena #{game.arenaId}</span>
                </div>
              {/if}
            </div>
          </CardContent>
        </Card>
      {/each}
    </div>

    <!-- Empty State -->
    {#if games.length === 0}
      <Card class="text-center py-12">
        <CardContent>
          <div class="flex flex-col items-center space-y-4">
            <div class="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
              <svg class="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
              </svg>
            </div>
            <div>
              <h3 class="text-lg font-semibold text-slate-900 mb-2">No Upcoming Games</h3>
              <p class="text-slate-600">Check back later for the latest schedule updates.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    {/if}
  </div>
</div>