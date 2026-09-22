"use client";

import { useState } from "react";

import { Eye, EyeOff } from "lucide-react";
import { Control, Controller, FieldValues, Path } from "react-hook-form";

import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group";

type TFormInput<T extends FieldValues> = {
  name: Path<T>;
  label?: string;
  placeholder: string;
  description?: string;
  disabled?: boolean;
  type?: "email" | "password" | "text" | "number" | "url" | "tel";
  control: Control<T>;
  required?: boolean;
  min?: number;
  max?: number;
  autoComplete?: string;
  readOnly?: boolean;
  showAsterisk?: boolean;
};

export const FormInput = <T extends FieldValues>({
  label,
  disabled,
  name,
  placeholder,
  type,
  description,
  control,
  required,
  min,
  max,
  autoComplete,
  readOnly,
  showAsterisk = true,
}: TFormInput<T>) => {
  const [inputVisible, setInputVisible] = useState<"masked" | "visible">("masked");

  return (
    <Controller
      name={name}
      control={control}
      disabled={disabled}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          {label && (
            <FieldLabel htmlFor={name}>
              {label} {showAsterisk ? required && <span className="text-red-500">*</span> : null}
            </FieldLabel>
          )}
          <InputGroup>
            <InputGroupInput
              {...field}
              id={name}
              type={type === "password" ? (inputVisible === "visible" ? "text" : "password") : type || "text"}
              aria-invalid={fieldState.invalid}
              placeholder={placeholder}
              autoComplete={autoComplete}
              readOnly={readOnly}
              min={min}
              max={max}
            />
            {type === "password" && (
              <InputGroupAddon align="inline-end">
                <InputGroupButton
                  type="button"
                  className="cursor-pointer"
                  title={inputVisible === "visible" ? "Hide password" : "Show password"}
                  aria-label={inputVisible === "visible" ? "Hide password" : "Show password"}
                  onClick={() => setInputVisible((prev) => (prev === "masked" ? "visible" : "masked"))}
                >
                  {inputVisible === "visible" ? <Eye /> : <EyeOff />}
                </InputGroupButton>
              </InputGroupAddon>
            )}
          </InputGroup>
          {description && <FieldDescription>{description}</FieldDescription>}
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
};
