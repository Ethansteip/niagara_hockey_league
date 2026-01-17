// columns.ts
import type { ColumnDef } from "@tanstack/table-core";
import type { Roster, Player } from "$lib/drizzle/schema";
import { renderComponent } from "$lib/components/ui/data-table";
import DataTableSortButton from "./data-table-sort-button.svelte";

type RosterAndPlayer = Roster & Player;

export const createColumns = (options?: {
  hidePointsSort?: boolean;
}): ColumnDef<Partial<RosterAndPlayer>>[] => {
  const hidePointsSort = options?.hidePointsSort ?? false;

  return [
    {
      accessorKey: "names",
      header: "Name",
      cell: ({ row }) => {
        const { firstName, lastName } = row.original;
        return `${firstName} ${lastName}`;
      },
    },
    {
      accessorKey: "goals",
      header: "Goals",
      meta: {
        cellClass: "text-center md:text-left md:pl-4",
      },
    },
    {
      accessorKey: "assists",
      header: "Assists",
      meta: {
        cellClass: "text-center md:text-left md:pl-6",
      },
    },
    {
      accessorKey: "pims",
      header: "Penalty Minutes",
      meta: {
        headerClass: "hidden md:table-cell",
        cellClass: "hidden md:table-cell text-center md:text-left md:pl-13",
      },
    },
    {
      accessorKey: "points",
      header: ({ column }) => {
        return renderComponent(DataTableSortButton, {
          column: column,
          hideSort: hidePointsSort,
        });
      },
      meta: {
        headerClass: "font-bold p-3",
        cellClass: `text-primary font-bold text-center md:text-left ${
          hidePointsSort ? "md:pl-6" : "md:pl-13"
        }`,
      },
    },
  ];
};
