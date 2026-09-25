"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CheckIcon, ChevronDownIcon, SearchIcon } from "lucide-react";
import { getCountries, getCountryCallingCode, type Country } from "react-phone-number-input/input";
import flags from "react-phone-number-input/flags";
import en from "react-phone-number-input/locale/en.json";

import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { InputGroupAddon } from "@/components/ui/input-group";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

type CountrySelectProps = {
  value: Country;
  onChange: (country: Country) => void;
  disabled?: boolean;
  readOnly?: boolean;
};

type CountryOption = {
  code: Country;
  name: string;
  callingCode: string;
};

const COUNTRY_OPTIONS: CountryOption[] = getCountries()
  .map((code) => ({ code, name: en[code] ?? code, callingCode: getCountryCallingCode(code) }))
  .sort((a, b) => a.name.localeCompare(b.name));

const filterCountries = (query: string) => {
  const q = query.trim().toLowerCase().replace(/^\+/, "");
  if (!q) return COUNTRY_OPTIONS;
  return COUNTRY_OPTIONS.filter(
    (option) =>
      option.name.toLowerCase().includes(q) ||
      option.code.toLowerCase() === q ||
      option.callingCode.startsWith(q)
  );
};

const CountryFlag = ({ country, className }: { country: Country; className?: string }) => {
  const Flag = flags[country];
  return (
    <span
      className={cn(
        "inline-flex h-4 w-6 shrink-0 overflow-hidden rounded-[3px] bg-muted ring-1 ring-foreground/10 [&_svg]:size-full [&_svg]:object-cover",
        className
      )}
    >
      {Flag && <Flag title={en[country]} />}
    </span>
  );
};

type CountryListProps = {
  value: Country;
  onSelect: (country: Country) => void;
  autoFocus?: boolean;
  className?: string;
};

const CountryList = ({ value, onSelect, autoFocus, className }: CountryListProps) => {
  const [query, setQuery] = useState("");
  const options = useMemo(() => filterCountries(query), [query]);
  const [activeIndex, setActiveIndex] = useState(() =>
    Math.max(
      0,
      COUNTRY_OPTIONS.findIndex((option) => option.code === value)
    )
  );
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const hasScrolledRef = useRef(false);

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus({ preventScroll: true });
  }, [autoFocus]);

  useEffect(() => {
    listRef.current
      ?.querySelector<HTMLElement>(`[data-index="${activeIndex}"]`)
      ?.scrollIntoView({ block: hasScrolledRef.current ? "nearest" : "center" });
    hasScrolledRef.current = true;
  }, [activeIndex]);

  const handleQueryChange = (next: string) => {
    setQuery(next);
    setActiveIndex(0);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => Math.min(index + 1, options.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => Math.max(index - 1, 0));
    } else if (event.key === "Enter") {
      event.preventDefault();
      const option = options[activeIndex];
      if (option) onSelect(option.code);
    }
  };

  return (
    <div className={cn("flex min-h-0 flex-col", className)}>
      <div className="relative border-b p-2">
        <SearchIcon className="pointer-events-none absolute top-1/2 left-4.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(event) => handleQueryChange(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search country or code..."
          aria-label="Search country"
          role="combobox"
          aria-expanded
          aria-controls="country-select-list"
          aria-activedescendant={
            options[activeIndex] ? `country-option-${options[activeIndex].code}` : undefined
          }
          className="h-9 w-full rounded-md bg-muted/60 pr-3 pl-8 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring/40"
        />
      </div>

      <div
        ref={listRef}
        id="country-select-list"
        role="listbox"
        aria-label="Countries"
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-1 pb-[max(0.25rem,env(safe-area-inset-bottom))]"
      >
        {options.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">No country found.</p>
        ) : (
          options.map((option, index) => {
            const selected = option.code === value;
            return (
              <button
                key={option.code}
                id={`country-option-${option.code}`}
                type="button"
                role="option"
                aria-selected={selected}
                data-index={index}
                data-active={index === activeIndex || undefined}
                tabIndex={-1}
                onMouseMove={() => setActiveIndex(index)}
                onClick={() => onSelect(option.code)}
                className="flex w-full items-center gap-3 rounded-md px-2 py-2 text-left text-sm transition-colors data-active:bg-accent data-active:text-accent-foreground"
              >
                <CountryFlag country={option.code} />
                <span className="w-12 shrink-0 text-muted-foreground tabular-nums">
                  +{option.callingCode}
                </span>
                <span className="flex-1 truncate">{option.name}</span>
                <CheckIcon
                  className={cn("size-4 shrink-0 text-primary", !selected && "invisible")}
                />
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};

const triggerClassName =
  "flex h-full items-center gap-1.5 rounded-l-[calc(var(--radius-lg)-1px)] border-r border-input pr-2.5 pl-3 outline-none transition-colors hover:bg-muted/60 focus-visible:bg-muted/60 disabled:pointer-events-none disabled:opacity-50 data-popup-open:bg-muted/60";

const TriggerContent = ({ country }: { country: Country }) => (
  <>
    <CountryFlag country={country} />
    <ChevronDownIcon className="size-3.5 text-muted-foreground" />
  </>
);

export const CountrySelect = ({ value, onChange, disabled, readOnly }: CountrySelectProps) => {
  const [open, setOpen] = useState(false);
  const isMobile = useIsMobile();
  const isDisabled = disabled || readOnly;

  const handleSelect = (country: Country) => {
    onChange(country);
    setOpen(false);
  };

  const triggerLabel = `Country: ${en[value] ?? value} (+${getCountryCallingCode(value)})`;

  // Keep the portaled list outside `InputGroupAddon`: React events bubble through portals, and
  // the addon's onClick would steal focus from the search input back to the phone input.
  const addonClassName = "h-full self-stretch py-0 pl-0";

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={setOpen}>
        <InputGroupAddon className={addonClassName}>
          <DrawerTrigger
            disabled={isDisabled}
            aria-label={triggerLabel}
            className={triggerClassName}
          >
            <TriggerContent country={value} />
          </DrawerTrigger>
        </InputGroupAddon>
        <DrawerContent className="h-[85dvh]">
          <DrawerHeader className="pb-2">
            <DrawerTitle>Select country</DrawerTitle>
            <DrawerDescription>Choose your country calling code</DrawerDescription>
          </DrawerHeader>
          {open && <CountryList value={value} onSelect={handleSelect} className="flex-1" />}
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <InputGroupAddon className={addonClassName}>
        <PopoverTrigger
          disabled={isDisabled}
          aria-label={triggerLabel}
          className={triggerClassName}
        >
          <TriggerContent country={value} />
        </PopoverTrigger>
      </InputGroupAddon>
      <PopoverContent align="start" sideOffset={6} className="w-80 gap-0 p-0">
        {open && (
          <CountryList value={value} onSelect={handleSelect} autoFocus className="max-h-80" />
        )}
      </PopoverContent>
    </Popover>
  );
};
