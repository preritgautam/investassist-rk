import React, { ForwardedRef, forwardRef } from 'react';
import { InputGroup, InputLeftElement, InputProps, InputRightElement } from '@chakra-ui/input';
import { IconButton, Input } from '@chakra-ui/react';
import { PasswordHiddenIcon, PasswordIcon, PasswordVisibleIcon } from '../../icons';
import { useToggle } from '../../../../hooks/utils/useToggle';

export interface PasswordFieldProps extends Omit<InputProps, 'size'> {
  size?: 'sm' | 'md' | 'lg';
}

const iconSizeMap = {
  sm: 14,
  md: 16,
  lg: 18,
};

const marginMap = {
  sm: -2,
  md: 0,
  lg: 2,
};

// eslint-disable-next-line react/display-name
export const PasswordField = forwardRef(({ size, ...props }: PasswordFieldProps, ref: ForwardedRef<any>) => {
  const [showPassword, toggleShowPassword] = useToggle(false);

  return (
    <InputGroup>
      <InputLeftElement pointerEvents="none">
        <PasswordIcon size={iconSizeMap?.[size] ?? 16} mt={marginMap?.[size] ?? 0} color="gray.500"/>
      </InputLeftElement>
      <Input
        type={showPassword ? 'text' : 'password'} size={size} placeholder="Enter Password" {...props} ref={ref}
        autoComplete="current-password"
      />
      <InputRightElement width="4.5rem">
        <IconButton
          aria-label="show-password" icon={showPassword ? <PasswordVisibleIcon/> : <PasswordHiddenIcon/>}
          onClick={toggleShowPassword} size="sm" variant="ghost" mr={-7}
        />
      </InputRightElement>
    </InputGroup>
  );
});
