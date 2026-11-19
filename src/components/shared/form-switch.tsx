"use client";

import { Control, Controller, FieldValues, Path } from "react-hook-form";

import { Field, FieldContent, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";
import { RequiredMark } from "@/components/shared/required-mark";

type TFormSwitch<T extends FieldValues> = {
  name: Path<T>;
  control: Control<T>;
  label?: string;
  description?: string;
  disabled?: boolean;
  required?: boolean;
  showAsterisk?: boolean;
};

export const FormSwitch = <T extends FieldValues>({
  name,
  control,
  label,
  description,
  disabled,
  required,
  showAsterisk = true,
}: TFormSwitch<T>) => {
  return (
    <Controller
      name={name}
      control={control}
      disabled={disabled}
      render={({ field, fieldState }) => {
        return (
          <Field orientation={"horizontal"} data-invalid={fieldState.invalid}>
            <FieldContent>
              {label && (
                <FieldLabel htmlFor={name}>
                  {label} {showAsterisk ? required && <RequiredMark /> : null}{" "}
                </FieldLabel>
              )}
              {description && <FieldDescription> {description} </FieldDescription>}
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </FieldContent>
            <Switch
              id={name}
              name={field.name}
              checked={field.value}
              onCheckedChange={field.onChange}
              aria-invalid={fieldState.invalid}
            />
          </Field>
        );
      }}
    />
  );
};
