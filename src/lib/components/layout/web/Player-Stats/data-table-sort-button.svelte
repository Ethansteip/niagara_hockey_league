<script lang="ts">
  import type { ComponentProps } from "svelte";
  import type { Column } from "@tanstack/table-core";
  import ArrowUpDownIcon from "@lucide/svelte/icons/arrow-up-down";
  import { Button } from "$lib/components/ui/button/index.js";
 
  type Props = {
    column: Column<any, unknown>;
    hideSort: boolean // This is the correct type
  } & Omit<ComponentProps<typeof Button>, 'onclick'>

  let { 
    column,
    variant = "ghost",
    hideSort = false,
    ...restProps
  }: Props = $props();
  
  const handleClick = () => {
    column.toggleSorting(column.getIsSorted() === "asc");
  };
</script>

{#if hideSort}
<span>Points</span>
{:else}
<Button variant="default" size="icon" class="flex md:hidden items-center justify-center cursor-pointer" onclick={handleClick} {...restProps}>
  <ArrowUpDownIcon />
</Button>

<Button variant="outline" class="hidden md:flex items-center justify-center cursor-pointer" onclick={handleClick} {...restProps}>
  <span class="hidden md:flex">Points</span>
  <ArrowUpDownIcon />
</Button>
{/if}