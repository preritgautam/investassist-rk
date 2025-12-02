import React from 'react';
import { OmitRegisterProps, RegisterFieldProps } from './types';
import { FormControl, FormControlProps, FormLabel } from '@chakra-ui/react';
import { DateInput, DateInputProps } from '../../../core/DateInput';
import { FieldErrorMessage } from '../../../../../bootstrap/chakra/components/core/form/FieldErrorMessage';

interface ISODateFieldProps extends RegisterFieldProps, FormControlProps {
  label: string;
  inputProps?: OmitRegisterProps<DateInputProps>;
}

export function ISODateField(
  {
    label, inputProps,
    register, name, rules, error,
    ...rest
  }: ISODateFieldProps) {
  return (
    <FormControl {...rest}>
      <FormLabel>{label}</FormLabel>
      <DateInput {...inputProps} {...register(name, rules)}/>
      <FieldErrorMessage error={error}/>
    </FormControl>
  );
}
