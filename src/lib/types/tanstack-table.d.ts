import "@tanstack/table-core";

declare module "@tanstack/table-core" {
  interface ColumnMeta<TData, TValue> {
    headerClass?: string;
    cellClass?: string;
  }
}
