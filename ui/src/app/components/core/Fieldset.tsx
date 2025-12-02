import React, { ReactNode } from 'react';
import { FormControl, FormControlProps, FormLabel } from '@chakra-ui/react';

export interface FieldsetProps extends Omit<FormControlProps, 'label'> {
  label: ReactNode,
  children: ReactNode,
}

export function Fieldset({ label, children, ...rest }: FieldsetProps) {
  return (
    <FormControl as="fieldset" p={3} pt={0} border="1px" borderColor="gray.200" {...rest}>
      <FormLabel as="legend">{label}</FormLabel>
      {children}
    </FormControl>
  );
}
