import React from 'react';
import { FormNumericInput, FormNumericInputProps } from '../../../core/NumericInput';
import { InputGroup, InputGroupProps } from '@chakra-ui/input';
import { FormControl, FormControlProps, FormLabel, InputLeftAddon, InputRightAddon } from '@chakra-ui/react';
import { ControlFieldProps, OmitControlProps } from './types';
import { FieldErrorMessage } from '../../../../../bootstrap/chakra/components/core/form/FieldErrorMessage';

export interface NumericFieldProps extends ControlFieldProps, FormControlProps {
  label?: string;
  inputGroupProps?: InputGroupProps;
  inputProps?: OmitControlProps<FormNumericInputProps>;
  inputRightAddOn?: string;
  inputLeftAddOn?: string;
}

export function NumericField(
  {
    label, inputGroupProps, inputProps, inputRightAddOn, inputLeftAddOn,
    control, name, rules, error,
    ...rest
  }: NumericFieldProps) {
  return (
    <FormControl {...rest}>
      {label && <FormLabel>{label}</FormLabel>}
      <InputGroup {...inputGroupProps}>
        {inputLeftAddOn && <InputLeftAddon>{inputLeftAddOn}</InputLeftAddon>}
        <FormNumericInput name={name} control={control} rules={rules} {...inputProps}/>
        {inputRightAddOn && <InputRightAddon>{inputRightAddOn}</InputRightAddon>}
      </InputGroup>
      <FieldErrorMessage error={error}/>
    </FormControl>
  );
}
