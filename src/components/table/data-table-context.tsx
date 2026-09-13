"use client";

import * as React from "react";
import { Suspense, createContext, useContext } from "react";
import type { RowData } from "@tanstack/react-table";

import type { DataTableColumnDef } from "@/components/table/features";
import { useDataTable, type UseDataTableOptions } from "@/components/table/hooks/use-data-table";
import { Skeleton } from "@/components/ui/skeleton";

type DataTableInstance<TData extends RowData> = ReturnType<typeof useDataTable<TData>>;

const DataTableContext = createContext<unknown>(null);

export const useDataTableContext = <TData extends RowData>() => {
  const context = useContext(DataTableContext);
  if (!context) {
    throw new Error("Data table components must be rendered within a <DataTableProvider>.");
  }
  return context as DataTableInstance<TData>;
};

type DataTableProviderProps<TData extends RowData> = UseDataTableOptions<TData> & {
  children: React.ReactNode;
};

const DataTableProviderContent = <TData extends RowData>({ children, ...options }: DataTableProviderProps<TData>) => {
  const table = useDataTable(options);
  return <DataTableContext.Provider value={table}>{children}</DataTableContext.Provider>;
};

/**
 * Owns the TanStack Table instance and URL-synced state for its subtree.
 * Compose the rest of the `data-table-*` components inside it:
 *
 * ```tsx
 * <DataTableProvider data={users} columns={columns}>
 *   <DataTableHeader
 *     filters={<DataTableSearch />}
 *     actions={<DataTableViewOptions />}
 *   />
 *   <DataTable />
 * </DataTableProvider>
 * ```
 */
export const DataTableProvider = <TData extends RowData>({ columns, ...props }: DataTableProviderProps<TData>) => {
  return (
    <Suspense fallback={<Skeleton className="h-64 w-full" />}>
      <DataTableProviderContent columns={columns as DataTableColumnDef<TData>[]} {...props} />
    </Suspense>
  );
};
