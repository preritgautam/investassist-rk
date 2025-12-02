import React from 'react';
import { ControlFieldProps, OmitRegisterProps } from './types';
import {
  FormControl,
  FormControlProps,
  RadioProps,
  RadioGroup,
  Radio,
  Stack, FormLabel,
} from '@chakra-ui/react';
import { Controller } from 'react-hook-form';

interface RadioFieldProps extends ControlFieldProps, FormControlProps {
  label: string;
  isDisabled: boolean;
  options: string[];
  radioProps?: OmitRegisterProps<Omit<RadioProps, 'defaultValue'>>;
}

export function RadioField(
  {
    label, radioProps, options,
    name, control, rules,
    isDisabled = false, ...rest
  }: RadioFieldProps) {
  return (
    <FormControl {...rest}>
      {label && <FormLabel>{label}</FormLabel>}
      <Controller
        name={name} control={control} rules={rules}
        render={({ field: { value, onChange, onBlur, ref } }) => (
          <RadioGroup {...radioProps} onChange={onChange} onBlur={onBlur} ref={ref}
            isDisabled={isDisabled} value={value as string}>
            <Stack direction='row'>
              {options.map((key: string) => (
                <Radio key={key} value={key}>{key}</Radio>
              ))}
            </Stack>
          </RadioGroup>
        )}
      />
    </FormControl>
  );
}
