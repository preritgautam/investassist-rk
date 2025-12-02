import React, { ForwardedRef, forwardRef } from 'react';
import {
  NumberDecrementStepper, NumberDecrementStepperProps,
  NumberIncrementStepper, NumberIncrementStepperProps, NumberInput,
  NumberInputField, NumberInputFieldProps,
  NumberInputProps,
  NumberInputStepper, NumberInputStepperProps,
} from '@chakra-ui/react';
import { Control, Controller } from 'react-hook-form';
import { RegisterOptions } from 'react-hook-form/dist/types/validator';


const formatter = new Intl.NumberFormat('en-US');

const _format = (val: string) => {
  if (typeof val === 'number') {
    val = `${val}`;
  }

  // return empty if already empty
  if (!val) return '';

  if (val === '.' || val === '.0') {
    return '0.';
  }

  if (val === '-') {
    return '-';
  }

  // remove everything except digits and '.'
  const v = val.replace(/[^\d.-]/, '');

  // split whole and fraction parts
  const [whole, fraction] = v.split('.');

  const formattedWhole = formatter.format(parseInt(whole));

  if (val.indexOf('.') === -1) {
    return formattedWhole;
  } else {
    return `${formattedWhole}.${fraction}`;
  }
};

const _parse = (val) => val.replace(/[^\d.-]/, '');

export interface NumericInputProps extends NumberInputProps {
  fieldProps?: NumberInputFieldProps,
  stepperProps?: NumberInputStepperProps,
  incrementProps?: NumberIncrementStepperProps,
  decrementProps?: NumberDecrementStepperProps,
  dontFormat?: boolean,
}

export const NumericInput = forwardRef(function NumericInput(
  {
    fieldProps,
    stepperProps,
    incrementProps,
    decrementProps,
    dontFormat = false,
    ...rest
  }: NumericInputProps, ref: ForwardedRef<HTMLInputElement>,
) {
  return (
    <NumberInput format={dontFormat ? undefined : _format} parse={dontFormat ? undefined : _parse} {...rest}>
      <NumberInputField ref={ref} pattern={undefined} {...fieldProps}/>
      <NumberInputStepper {...stepperProps}>
        <NumberIncrementStepper {...incrementProps}/>
        <NumberDecrementStepper {...decrementProps}/>
      </NumberInputStepper>
    </NumberInput>
  );
});

export interface FormNumericInputProps extends NumericInputProps {
  name: string,
  control: Control<any>,
  rules?: Omit<RegisterOptions<any>, 'valueAsNumber' | 'valueAsDate' | 'setValueAs' | 'disabled'>,
}

export function FormNumericInput({ name, control, rules, ...rest }: FormNumericInputProps) {
  return (
    <Controller
      control={control} name={name}
      rules={rules}
      render={({ field: { onChange, onBlur, value, ref } }) => (
        <NumericInput
          min={0}
          {...rest}
          onChange={onChange}
          onBlur={(e) => {
            onBlur();
            if (isNaN(parseFloat(value))) {
              e.preventDefault();
              onChange(0);
            }
          }}
          value={value ?? ''}
          ref={ref}
        />
      )}
    />
  );
}
