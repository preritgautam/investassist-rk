import { ControlFieldProps, OmitRegisterProps } from './types';
import { Checkbox, CheckboxProps, FormControl, FormControlProps } from '@chakra-ui/react';
import React from 'react';
import { Controller } from 'react-hook-form';

interface CheckboxFieldProps extends ControlFieldProps, FormControlProps {
  label: string;
  isDisabled: boolean;
  checkboxProps?: OmitRegisterProps<CheckboxProps>;
}

export function CheckboxField(
  {
    label, checkboxProps,
    name, control, rules,
    isDisabled = false, ...rest
  }: CheckboxFieldProps) {
  return (
    <FormControl {...rest}>
      <Controller
        name={name} control={control} rules={rules}
        render={({ field: { value, onChange, onBlur, ref } }) => (
          <Checkbox
            {...checkboxProps} isChecked={!!value} onChange={onChange} onBlur={onBlur} ref={ref} isDisabled={isDisabled}
          >{label}</Checkbox>
        )}
      />

    </FormControl>
  );
}
