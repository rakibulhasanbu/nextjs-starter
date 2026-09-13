import * as React from "react";

import { cn } from "@/lib/utils";

type DataTableHeaderProps = {
    /** Left cluster — search box, filter selects/facets (things that narrow the view). */
    filters?: React.ReactNode;
    /** Right cluster — view options, primary actions like "Add" (things that act). */
    actions?: React.ReactNode;
    className?: string;
};

/**
 * Layout wrapper for a table's toolbar. Purely presentational — place it
 * above `<DataTable />`. The page's own title/description belongs in
 * `<PageHeader />`, not here.
 *
 * ```tsx
 * <DataTableHeader
 *   filters={
 *     <>
 *       <DataTableSearch />
 *       <DataTableFilter columnId="status" title="Status" options={statusOptions} />
 *     </>
 *   }
 *   actions={<Button>Add</Button>}
 * />
 * <DataTable />
 * ```
 */
export const DataTableHeader = ({ filters, actions, className }: DataTableHeaderProps) => {
    return (
        <div
            className={cn(
                "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between",
                className
            )}
        >
            <div className="flex flex-wrap items-center gap-2">{filters}</div>
            {actions && (
                <div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">
                    {actions}
                </div>
            )}
        </div>
    );
};
