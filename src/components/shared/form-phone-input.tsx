"use client";

import { Control, Controller, FieldValues, Path } from "react-hook-form";
import type { Country } from "react-phone-number-input";

import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { PhoneInput } from "@/components/ui/phone-input";
import { RequiredMark } from "@/components/shared/required-mark";

type TFormPhoneInput<T extends FieldValues> = {
  name: Path<T>;
  label?: string;
  placeholder?: string;
  description?: string;
  disabled?: boolean;
  control: Control<T>;
  required?: boolean;
  defaultCountry?: Country;
  autoComplete?: string;
  readOnly?: boolean;
  showAsterisk?: boolean;
};

export const FormPhoneInput = <T extends FieldValues>({
  label,
  disabled,
  name,
  placeholder,
  description,
  control,
  required,
  defaultCountry,
  autoComplete,
  readOnly,
  showAsterisk = true,
}: TFormPhoneInput<T>) => {
  return (
    <Controller
      name={name}
      control={control}
      disabled={disabled}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          {label && (
            <FieldLabel htmlFor={name}>
              {label} {showAsterisk ? required && <RequiredMark /> : null}
            </FieldLabel>
          )}
          <PhoneInput
            id={name}
            name={field.name}
            value={field.value}
            onChange={field.onChange}
            onBlur={field.onBlur}
            disabled={field.disabled}
            readOnly={readOnly}
            placeholder={placeholder}
            defaultCountry={defaultCountry}
            autoComplete={autoComplete}
            aria-invalid={fieldState.invalid}
          />
          {description && <FieldDescription>{description}</FieldDescription>}
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
};
