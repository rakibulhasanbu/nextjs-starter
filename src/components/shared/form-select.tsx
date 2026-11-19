"use client";

import { Control, Controller, FieldValues, Path } from "react-hook-form";

import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RequiredMark } from "@/components/shared/required-mark";

type TFormSelect<T extends FieldValues> = {
  name: Path<T>;
  control: Control<T>;
  options: {
    value: string;
    label: string;
  }[];
  label?: string;
  placeholder?: string;
  description?: string;
  disabled?: boolean;
  required?: boolean;
  showAsterisk?: boolean;
};

export const FormSelect = <T extends FieldValues>({
  name,
  control,
  options,
  label,
  placeholder,
  description,
  disabled,
  required,
  showAsterisk = true,
}: TFormSelect<T>) => {
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
          <Select name={field.name} value={field.value} onValueChange={field.onChange}>
            <SelectTrigger id={name} aria-invalid={fieldState.invalid}>
              <SelectValue placeholder={placeholder || "Select..."} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {description && <FieldDescription>{description}</FieldDescription>}
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
};
