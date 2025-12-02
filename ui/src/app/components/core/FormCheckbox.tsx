import { Checkbox, CheckboxProps } from '@chakra-ui/react';
import { Control, Controller } from 'react-hook-form';
import React from 'react';

interface FormCheckboxProps extends Omit<CheckboxProps, 'isChecked' | 'onChange' | 'onBlur' | 'value'> {
  control: Control<any>;
  name: string;
}

export function FormCheckbox({ control, name, ...rest }: FormCheckboxProps) {
  return (
    <Controller
      control={control} name={name}
      render={({ field: { onChange, onBlur, value, ref } }) => (
        <Checkbox isChecked={!!value} onChange={onChange} onBlur={onBlur} value={value} ref={ref} {...rest}/>
      )}
    />
  );
}
