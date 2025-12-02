import React, { ForwardedRef, forwardRef } from 'react';
import { InputGroup, InputLeftElement, InputProps } from '@chakra-ui/input';
import { Input } from '@chakra-ui/react';
import { UserIcon } from '../../icons';

export interface EmailFieldProps extends Omit<InputProps, 'size'> {
  size?: 'sm' | 'md' | 'lg';
}

const iconSizeMap = {
  sm: 18,
  md: 20,
  lg: 22,
};

const marginMap = {
  sm: -2,
  md: 0,
  lg: 2,
};

// eslint-disable-next-line react/display-name
export const EmailField = forwardRef(({ size, ...props }: EmailFieldProps, ref: ForwardedRef<any>) => {
  return (
    <InputGroup>
      <InputLeftElement pointerEvents="none">
        <UserIcon size={iconSizeMap?.[size] ?? 20} mt={marginMap?.[size] ?? 0} color="gray.500"/>
      </InputLeftElement>
      <Input type="email" size={size} placeholder="Enter Email Address" autoComplete="username" ref={ref} {...props} />
    </InputGroup>
  );
});
