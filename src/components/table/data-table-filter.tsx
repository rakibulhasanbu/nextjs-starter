"use client";

import { PlusCircleIcon, XIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { useDataTableContext } from "@/components/table/data-table-context";
import type { DataTableFilterOption } from "@/components/table/types";

type DataTableFilterProps = {
  /** Id of the column to filter (must match the accessor/column id). */
  columnId: string;
  title: string;
  options: DataTableFilterOption[];
  className?: string;
};

/**
 * A single-select filter bound to a column and synced to the URL, e.g.
 * `<DataTableFilter columnId="status" title="Status" options={statusOptions} />`.
 * Mirrors `DataTableFacetedFilter`'s trigger/popover design, but only one
 * option can be active at a time (selecting an option replaces the value,
 * re-selecting the active option clears it). Give the target column
 * `filterFn: "equalsString"` (registered in `features.ts`) so the match is
 * exact rather than substring-based.
 */
export const DataTableFilter = ({ columnId, title, options, className }: DataTableFilterProps) => {
  const table = useDataTableContext();
  const column = table.getColumn(columnId);

  if (!column) return null;

  const selected = column.getFilterValue() as string | undefined;
  const selectedOption = options.find((option) => option.value === selected);

  const toggle = (value: string) => {
    column.setFilterValue(value === selected ? undefined : value);
  };

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button variant="outline" size="sm" className={cn("border-dashed", className)}>
            <PlusCircleIcon data-icon="inline-start" />
            {title}
            {selectedOption && (
              <>
                <Separator orientation="vertical" className="mx-1 h-4" />
                <Badge variant="secondary" className="gap-1 rounded-sm px-1 font-normal">
                  {selectedOption.label}
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
            const checked = option.value === selected;
            return (
              <Button
                key={option.value}
                type="button"
                onClick={() => toggle(option.value)}
                aria-pressed={checked}
                variant="ghost"
                className="h-auto w-full justify-start gap-2 px-2 py-1.5 text-left text-sm font-normal"
              >
                <span
                  className={cn(
                    "flex aspect-square size-4 shrink-0 items-center justify-center rounded-full border border-input",
                    checked && "border-primary bg-primary"
                  )}
                >
                  {checked && <span className="size-2 rounded-full bg-primary-foreground" />}
                </span>
                <span className="flex-1 truncate">{option.label}</span>
              </Button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
};
