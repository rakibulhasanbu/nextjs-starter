"use client";

import { Control, Controller, FieldValues, Path } from "react-hook-form";

import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

interface FormOTPInputProps<T extends FieldValues> {
    control: Control<T>;
    name: Path<T>;
    label?: string;
    description?: string;
    length?: number;
    pattern?: string;
    disabled?: boolean;
}

export const FormOTPInput = <T extends FieldValues>({
    control,
    name,
    label,
    description,
    length = 4,
    pattern,
    disabled,
}: FormOTPInputProps<T>) => {
    return (
        <Controller
            name={name}
            control={control}
            disabled={disabled}
            render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                    {label && <FieldLabel htmlFor={name}>{label}</FieldLabel>}
                    <InputOTP maxLength={length} {...field} pattern={pattern}>
                        <InputOTPGroup>
                            {Array.from({ length }, (_, index) => (
                                <InputOTPSlot key={index} index={index} />
                            ))}
                        </InputOTPGroup>
                    </InputOTP>
                    {description && <FieldDescription>{description}</FieldDescription>}
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
            )}
        />
    );
};
