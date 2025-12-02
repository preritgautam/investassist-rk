import React, { ForwardedRef, forwardRef, useCallback } from 'react';
import { NumericInput, NumericInputProps } from './NumericInput';
import { Control, Controller } from 'react-hook-form';
import { RegisterOptions } from 'react-hook-form/dist/types/validator';

export interface YearTextInputProps extends NumericInputProps {
}

export const YearTextinput = forwardRef(function YearTextInput(
  { onBlur, onChange, min, max, ...rest }: YearTextInputProps, ref: ForwardedRef<HTMLInputElement>,
) {
  const handleBlur = useCallback((e) => {
    const currentValue = Number(e.target.value);
    let updatedValue = currentValue;

    if (!isNaN(currentValue)) {
      const currentYearLastTwoDigits = new Date().getFullYear() % 100;
      if (currentValue >= 0 && currentValue <= currentYearLastTwoDigits) {
        updatedValue += 2000;
      } else if (currentValue >= 0 && currentValue < 100) {
        updatedValue += 1900;
      } else if (min && currentValue < min) {
        updatedValue = min;
      } else if (max && currentValue > max) {
        updatedValue = max;
      }
    }
    onChange(String(updatedValue), updatedValue);
    onBlur?.(e);
  }, [max, min, onBlur, onChange]);

  return (
    <NumericInput ref={ref} onBlur={handleBlur} clampValueOnBlur={false} dontFormat onChange={onChange} {...rest}/>
  );
});

export interface FormYearTextInputProps extends YearTextInputProps {
  name: string,
  control: Control<any>,
  rules?: Omit<RegisterOptions<any>, 'valueAsNumber' | 'valueAsDate' | 'setValueAs' | 'disabled'>,
}

export function FormYearTextInput({ name, control, rules, ...rest }: FormYearTextInputProps) {
  return (
    <Controller
      control={control} name={name} rules={rules}
      render={({ field: { onBlur, value, onChange, ref } }) => (
        <YearTextinput {...rest} onChange={onChange} onBlur={onBlur} value={value} ref={ref}/>
      )}
    />
  );
}

