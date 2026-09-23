"use client";

import { useState } from "react";

import PhoneNumberInput, {
  parsePhoneNumber,
  type Country,
  type Value,
} from "react-phone-number-input/input";

import { cn } from "@/lib/utils";
import { InputGroup, InputGroupInput } from "@/components/ui/input-group";
import { CountrySelect } from "@/components/shared/country-select";
import { useDebouncedCallback } from "@/components/table/hooks/use-debounced-callback";

export type PhoneInputValue = Value;

const PhoneNumberField = ({ className, ...props }: React.ComponentProps<"input">) => (
  <InputGroupInput className={cn("pl-3", className)} {...props} />
);

type PhoneInputProps = {
  value?: PhoneInputValue;
  onChange: (value?: PhoneInputValue) => void;
  onBlur?: () => void;
  defaultCountry?: Country;
  disabled?: boolean;
  readOnly?: boolean;
  placeholder?: string;
  id?: string;
  name?: string;
  autoComplete?: string;
  "aria-invalid"?: boolean;
};

export const PhoneInput = ({
  value,
  onChange,
  defaultCountry = "US",
  disabled,
  readOnly,
  ...props
}: PhoneInputProps) => {
  const [country, setCountry] = useState<Country>(
    () => parsePhoneNumber(value ?? "")?.country ?? defaultCountry
  );

  // `react-phone-number-input` re-syncs its internal digits from the `value` prop on every
  // change via a `useEffect`. Feeding a fast-changing controlled `value` straight back in (e.g.
  // from react-hook-form) races that effect and can spiral into "Maximum update depth exceeded"
  // while typing quickly. Debouncing the outward `onChange` breaks that race.
  // https://github.com/catamphetamine/react-phone-number-input/issues/441
  const debouncedOnChange = useDebouncedCallback((next?: PhoneInputValue) => onChange(next), 100);

  return (
    <InputGroup className="gap-0">
      <CountrySelect
        value={country}
        onChange={setCountry}
        disabled={disabled}
        readOnly={readOnly}
      />
      <PhoneNumberInput
        international
        withCountryCallingCode
        smartCaret={false}
        country={country}
        value={value}
        onChange={debouncedOnChange}
        disabled={disabled}
        readOnly={readOnly}
        inputComponent={PhoneNumberField}
        {...props}
      />
    </InputGroup>
  );
};
