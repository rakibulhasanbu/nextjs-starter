"use client";

import { getCountries, getCountryCallingCode, type Country } from "react-phone-number-input/input";
import flags from "react-phone-number-input/flags";
import en from "react-phone-number-input/locale/en.json";

import { InputGroupAddon } from "@/components/ui/input-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type CountrySelectProps = {
  value: Country;
  onChange: (country: Country) => void;
  disabled?: boolean;
  readOnly?: boolean;
};

const CountryFlag = ({ country }: { country: Country }) => {
  const Flag = flags[country];
  if (!Flag) return null;
  return (
    <span className="inline-flex h-3.5 w-5 shrink-0 items-center overflow-hidden rounded-[2px]">
      <Flag title={en[country]} />
    </span>
  );
};

export const CountrySelect = ({ value, onChange, disabled, readOnly }: CountrySelectProps) => {
  return (
    <InputGroupAddon>
      <Select
        value={value}
        onValueChange={(next) => next && onChange(next as Country)}
        disabled={disabled || readOnly}
      >
        <SelectTrigger className="h-6 w-24 border-0 bg-transparent px-1 shadow-none">
          <SelectValue>
            <span className="inline-flex items-center gap-1.5">
              <CountryFlag country={value} />+{getCountryCallingCode(value)}
            </span>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {getCountries().map((country) => (
            <SelectItem key={country} value={country}>
              <span className="inline-flex items-center gap-2">
                <CountryFlag country={country} />
                {en[country]} (+{getCountryCallingCode(country)})
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </InputGroupAddon>
  );
};
