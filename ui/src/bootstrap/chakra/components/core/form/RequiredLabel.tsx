import React from 'react';
import { TextProps, Text } from '@chakra-ui/react';

export interface RequiredLabelProps extends TextProps {
  label?: string,
}

export function RequiredLabel({ label, ...rest }: RequiredLabelProps) {
  return (
    <Text color="danger.500" size="sm" as="span" {...rest}>{label ?? '*'}</Text>
  );
}

export const requiredLabel = <RequiredLabel/>;
