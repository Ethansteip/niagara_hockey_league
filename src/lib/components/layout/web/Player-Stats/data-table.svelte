<script lang="ts" generics="TData, TValue">
  import { type ColumnDef, getCoreRowModel, getFilteredRowModel, getSortedRowModel, type ColumnFiltersState, type SortingState } from "@tanstack/table-core";
  import {
    createSvelteTable,
    FlexRender
  } from "$lib/components/ui/data-table/index";
  import * as Table from "$lib/components/ui/table/index";
  import Button from "$lib/components/ui/button/button.svelte";
  import Input from "$lib/components/ui/input/input.svelte";
  import moment from 'moment';

  type DataTableProps<TData, TValue> = {
    columns: ColumnDef<TData, TValue>[];
    data: TData[],
    hideLink: boolean;
    hideSearch: boolean;
    lastUpdated: Date | null;
  };

  let { data, columns, hideLink = true, hideSearch = false, lastUpdated }: DataTableProps<TData, TValue> = $props();

  let sorting = $state<SortingState>([]);
  let columnFilters = $state<ColumnFiltersState>([]);
  let relativeTime = $derived(moment(lastUpdated).fromNow());

  const table = createSvelteTable({
    get data() {
      return data;
    },
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: (updater) => {
      if (typeof updater === "function") {
        sorting = updater(sorting);
      } else {
        sorting = updater;
      }
    },
    onColumnFiltersChange: (updater) => {
      if (typeof updater === "function") {
        columnFilters = updater(columnFilters);
      } else {
        columnFilters = updater;
      }
    },
    state: {
      get sorting() {
        return sorting;
      },
      get columnFilters() {
        return columnFilters;
      },
    },
  });
</script>

<section class="mb-20">
<div class="flex items-center justify-between mt-5 mb-3">
  <div>
    <h1 class="text-3xl font-bold text-foreground">Player Stats</h1>
    <span class="text-xs text-primary">Last updated {relativeTime}...</span>
  </div>
  {#if !hideSearch}
    <div class="flex items-center py-4">
      <Input
        placeholder="Search by name..."
        value={(table.getColumn("names")?.getFilterValue() as string) ?? ""}
        onchange={(e) => {
          table.getColumn("names")?.setFilterValue(e.currentTarget.value);
        }}
        oninput={(e) => {
          table.getColumn("names")?.setFilterValue(e.currentTarget.value);
        }}
        class="w-80 hidden md:flex"
      />
    </div>
  {/if}
</div>
<div class="">
  <Table.Root class="">
    <Table.Header class="bg-card">
      {#each table.getHeaderGroups() as headerGroup (headerGroup.id)}
        <Table.Row class="rounded-lg">
          {#each headerGroup.headers as header (header.id)}
            <Table.Head colspan={header.colSpan} class={header.column.columnDef.meta?.headerClass || ''}>
              {#if !header.isPlaceholder}
                <FlexRender
                  content={header.column.columnDef.header}
                  context={header.getContext()}
                />
              {/if}
            </Table.Head>
          {/each}
        </Table.Row>
      {/each}
    </Table.Header>
    <Table.Body>
      {#each table.getRowModel().rows as row (row.id)}
        <Table.Row data-state={row.getIsSelected() && "selected"}>
          {#each row.getVisibleCells() as cell (cell.id)}
            <Table.Cell class={cell?.column?.columnDef?.meta?.cellClass || ''}>
              <FlexRender
                content={cell.column.columnDef.cell}
                context={cell.getContext()}
              />
            </Table.Cell>
          {/each}
        </Table.Row>
      {:else}
        <Table.Row>
          <Table.Cell colspan={columns.length} class="h-24 text-center">
            No results.
          </Table.Cell>
        </Table.Row>
      {/each}
    </Table.Body>
  </Table.Root>
</div>

{#if !hideLink}
<div class="mb-5 w-full  flex items-center justify-end">
  <Button variant="link" href="/player-stats" class="cursor-pointer">View All</Button>
</div>
{/if}
</section>