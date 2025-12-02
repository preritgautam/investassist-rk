import React from 'react';
import { FormNumericInput, FormNumericInputProps, NumericInput, NumericInputProps } from './NumericInput';
import { Control } from 'react-hook-form';
import { InputGroup, InputGroupProps, InputLeftElement } from '@chakra-ui/input';
import { Icon, InputLeftAddon } from '@chakra-ui/react';
import { CurrencyFormatIcon } from '../app/icons';

export interface AmountInputProps extends InputGroupProps {
  inputProps?: NumericInputProps;
}

export function AmountInput({ inputProps, ...rest }: AmountInputProps) {
  return (
    <InputGroup {...rest}>
      <InputLeftElement pointerEvents="none">
        <Icon as={CurrencyFormatIcon}/>
      </InputLeftElement>
      <NumericInput {...inputProps} />
    </InputGroup>
  );
}


export interface FormAmountInputProps extends InputGroupProps {
  name: string,
  control: Control<any>,
  inputProps?: Omit<FormNumericInputProps, 'name' | 'control'>,
}

export function FormAmountInput({ inputProps, name, control, ...rest }: FormAmountInputProps) {
  return (
    <InputGroup {...rest}>
      <InputLeftAddon pointerEvents="none">$</InputLeftAddon>
      <FormNumericInput name={name} control={control} flexGrow={1} {...inputProps}/>
    </InputGroup>
  );
}
