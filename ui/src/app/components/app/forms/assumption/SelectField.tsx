import React from 'react';
import { OmitRegisterProps, RegisterFieldProps } from './types';
import { FormControl, FormControlProps, FormLabel, Select, SelectProps } from '@chakra-ui/react';
import { FieldErrorMessage } from '../../../../../bootstrap/chakra/components/core/form/FieldErrorMessage';

interface SelectFieldProps extends RegisterFieldProps, FormControlProps {
  label?: string;
  options: Record<string, string>;
  selectProps?: OmitRegisterProps<SelectProps>;
}

export function SelectField(
  {
    label, options, selectProps,
    register, name, rules, error,
    ...rest
  }: SelectFieldProps) {
  return (
    <FormControl {...rest}>
      {label && (<FormLabel>{label}</FormLabel>)}
      <Select {...selectProps} {...register(name, rules)}>
        <option value="">-Select-</option>
        {Reflect.ownKeys(options).map((key: string) => (
          <option key={key} value={key}>{options[key]}</option>
        ))}
      </Select>
      <FieldErrorMessage error={error}/>
    </FormControl>
  );
}
