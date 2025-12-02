import { FormControl, FormControlProps, FormLabel, Input, InputProps } from '@chakra-ui/react';
import { FieldErrorMessage } from '../../../../../bootstrap/chakra/components/core/form/FieldErrorMessage';
import React from 'react';
import { OmitRegisterProps, RegisterFieldProps } from './types';

interface TextFieldProps extends RegisterFieldProps, FormControlProps {
  label: string;
  inputProps?: OmitRegisterProps<InputProps>;
}

export function TextField(
  {
    label, inputProps,
    register, name, rules, error,
    ...rest
  }: TextFieldProps,
) {
  return (
    <FormControl {...rest}>
      <FormLabel>{label}</FormLabel>
      <Input {...inputProps} {...register(name, rules)} />
      <FieldErrorMessage error={error}/>
    </FormControl>
  );
}
