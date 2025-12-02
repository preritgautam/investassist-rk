import React, { forwardRef } from 'react';
import { Input } from '@chakra-ui/react';
import { InputProps } from '@chakra-ui/input';

export interface DateInputProps extends InputProps {

}

// eslint-disable-next-line react/display-name
export const DateInput = forwardRef(({ ...rest }: DateInputProps, ref: React.ForwardedRef<HTMLInputElement>) => {
  return (
    <Input max="9999-12-31" {...rest} ref={ref} type="date"/>
  );
});
