"use client";

import { PlusCircleIcon, XIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { useDataTableContext } from "@/components/table/data-table-context";
import type { DataTableFilterOption } from "@/components/table/types";

type DataTableFacetedFilterProps = {
  /** Id of the column to filter (must match the accessor/column id). */
  columnId: string;
  title: string;
  options: DataTableFilterOption[];
  className?: string;
};

/** Column filter value is normalized to an array regardless of how it was
 * last written (a bare string can come back from URL deserialization when
 * exactly one option is selected). */
const toValues = (raw: unknown): string[] => {
  if (Array.isArray(raw)) return raw as string[];
  if (typeof raw === "string" && raw) return [raw];
  return [];
};

/**
 * A multi-select filter bound to a column and synced to the URL, e.g.
 * `<DataTableFacetedFilter columnId="status" title="Status" options={statusOptions} />`.
 * Give the target column `filterFn: "arrHas"` (registered in `features.ts`)
 * so a row matches when its scalar value is any of the selected options.
 * For "does this array cell contain any of the selected values" filters
 * (e.g. a tags column), use `filterFn: "arrIncludesSome"` instead.
 */
export const DataTableFacetedFilter = ({ columnId, title, options, className }: DataTableFacetedFilterProps) => {
  const table = useDataTableContext();
  const column = table.getColumn(columnId);

  if (!column) return null;

  const selected = new Set(toValues(column.getFilterValue()));

  const toggle = (value: string) => {
    const next = new Set(selected);
    if (next.has(value)) next.delete(value);
    else next.add(value);
    column.setFilterValue(next.size > 0 ? Array.from(next) : undefined);
  };

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button variant="outline" size="sm" className={cn("border-dashed", className)}>
            <PlusCircleIcon data-icon="inline-start" />
            {title}
            {selected.size > 0 && (
              <>
                <Separator orientation="vertical" className="mx-1 h-4" />
                <Badge variant="secondary" className="gap-1 rounded-sm px-1 font-normal">
                  {selected.size}
                  <span
                    role="button"
                    tabIndex={-1}
                    aria-label={`Clear ${title} filter`}
                    onClick={(event) => {
                      event.stopPropagation();
                      column.setFilterValue(undefined);
                    }}
                    className="rounded-xs hover:bg-muted-foreground/20"
                  >
                    <XIcon className="size-3" />
                  </span>
                </Badge>
              </>
            )}
          </Button>
        }
      />
      <PopoverContent align="start" className="w-56 gap-1 p-1">
        <div className="flex flex-col">
          {options.map((option) => {
            const checked = selected.has(option.value);
            return (
              <Button
                key={option.value}
                type="button"
                onClick={() => toggle(option.value)}
                variant="ghost"
                className="h-auto w-full justify-start gap-2 px-2 py-1.5 text-left text-sm font-normal"
              >
                <Checkbox checked={checked} className="pointer-events-none" tabIndex={-1} />
                <span className="flex-1 truncate">{option.label}</span>
              </Button>
            );
          })}
        </div>
        {selected.size > 0 && (
          <>
            <Separator className="mt-1" />
            <Button
              type="button"
              onClick={() => column.setFilterValue(undefined)}
              variant="ghost"
              className="h-auto w-full px-2 py-1.5 text-center text-sm font-normal text-muted-foreground"
            >
              Clear filter
            </Button>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
};
