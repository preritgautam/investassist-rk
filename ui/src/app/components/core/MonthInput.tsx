import React, { ForwardedRef, forwardRef } from 'react';
import { Input } from '@chakra-ui/react';
import { InputProps } from '@chakra-ui/input';

export interface MonthInputProps extends InputProps {

}

export const MonthInput = forwardRef(
  function MonthInput({ ...rest }: MonthInputProps, ref: ForwardedRef<HTMLInputElement>) {
    return (
      <Input {...rest} ref={ref} type="month"/>
    );
  },
);
