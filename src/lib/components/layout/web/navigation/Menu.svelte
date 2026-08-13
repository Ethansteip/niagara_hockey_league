<script lang="ts">
  import * as Popover from "$lib/components/ui/popover/index.js";
  import Button from "$lib/components/ui/button/button.svelte";
  import { Menu, CalendarCheck, Calendar, ChartColumn } from "@lucide/svelte";
	import Separator from "$lib/components/ui/separator/separator.svelte";

  let open = $state(false)

  const handleClose = () => open = false;
</script>

<Popover.Root bind:open>
  <Popover.Trigger>
    <Button variant="ghost" size="icon">
      <Menu />
    </Button>
  </Popover.Trigger>
  <Popover.Content sideOffset={25} class="mr-[3vw] border-secondary">
    <Button href="/" variant="ghost" class="flex justify-start gap-2" onclick={handleClose}>
      <CalendarCheck />
      Upcoming Games
    </Button>
    <Button href="/" variant="ghost" class="flex justify-start gap-2" onclick={handleClose}>
      <Calendar />
      All Games
    </Button>
    <Separator />
    <Button href="/" variant="ghost" class="flex justify-start gap-2" onclick={handleClose}>
      <ChartColumn />
      Player Stats
    </Button>
  </Popover.Content>
</Popover.Root>