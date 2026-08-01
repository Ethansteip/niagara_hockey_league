<script lang="ts">
import { Zap } from "@lucide/svelte";
import Separator from "$lib/components/ui/separator/separator.svelte";
import Button from "$lib/components/ui/button/button.svelte";
import Menu from "$lib/components/layout/web/navigation/Menu.svelte";
</script>

<nav class="sticky w-full md:w-full h-18 bg-background border-2 border-secondary shadow my-4 rounded-xl flex items-center justify-between px-3 mx-auto md:px-6">
<!-- Section 1 -->
  <div class="flex justify-start w-1/4 md:w-1/3 gap-2">
    <a href="/">
      <Zap />
    </a>
    <div class="w-full hidden md:flex gap-2">
      <Separator orientation="vertical"/>
      <h1 class="text-md md:text-large font-bold text-center">Tuesday Night Hockey</h1>
    </div>
  </div>
  <!-- Section 2 -->
  <div class="w-1/2 flex justify-center md:hidden">
    <h1 class="text-md md:text-large font-bold text-center">Tuesday Night Hockey</h1>
  </div>
  <!-- Section 3 -->
  <div class="w-1/4 md:w-1/2 flex">
    <div class="items-center gap-2 hidden md:flex w-full justify-end">
      <Button variant="ghost" href="/">
      Upcoming Games
      </Button>
      <Button variant="ghost" href="/">
        All Games
      </Button>
      <Button variant="ghost" href="/">
        Stats
      </Button>
    </div>
    <div class="items-center w-full flex justify-end md:hidden">
      <Menu />
    </div>
  </div>
</nav>