<script lang="ts">
</script>

{#snippet loading(num: number)}
  {#each Array(num)}
    <div class="w-full flex items-center jutsify-start bg-secondary h-auto animate-pulse rounded-lg">
    <div class="flex flex-col p-3 md:p-5 w-full gap-5">
      <div class="w-1/3 h-6 rounded-full bg-secondary-foreground/10"></div>
      <div class="flex w-full items-center justify-center gap-15">
        <div class="size-25 rounded-lg bg-secondary-foreground/10"></div>
        <div class="size-25 rounded-lg bg-secondary-foreground/10"></div>
      </div>
      <div class="flex w-full justify-end">
        <div class="w-1/5 h-6 rounded-full bg-secondary-foreground/10"></div>
      </div>
    </div>
    </div>
  {/each}
{/snippet}

<div class="flex flex-col w-full gap-5 mt-5 md:mt-10">
  <div>
    <h1 class="text-xl md:text-4xl font-bold text-foreground">Upcoming Games</h1>
  </div>
  <div class="flex flex-col md:flex-row w-full gap-5 md:gap-10">
    {@render loading(2)}
  </div>
</div>
