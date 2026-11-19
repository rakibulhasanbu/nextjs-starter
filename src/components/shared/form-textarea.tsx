"use client";

import { Control, Controller, FieldValues, Path } from "react-hook-form";

import { cn } from "@/lib/utils";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { RequiredMark } from "@/components/shared/required-mark";

type TFormTextarea<T extends FieldValues> = {
  name: Path<T>;
  control: Control<T>;
  label?: string;
  className?: string;
  placeholder: string;
  description?: string;
  required?: boolean;
  showAsterisk?: boolean;
  disabled?: boolean;
};

export const FormTextarea = <T extends FieldValues>({
  name,
  control,
  label,
  className,
  placeholder,
  description,
  required,
  showAsterisk = true,
  disabled,
}: TFormTextarea<T>) => {
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
          <Textarea
            {...field}
            id={name}
            aria-invalid={fieldState.invalid}
            placeholder={placeholder}
            value={field.value}
            className={cn("min-h-24", className)}
          />
          {description && <FieldDescription>{description}</FieldDescription>}
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
};
