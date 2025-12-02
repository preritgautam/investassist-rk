import React from 'react';
import { Tooltip as CTooltip, TooltipProps as CTooltipProps, Text } from '@chakra-ui/react';

export interface TooltipProps extends CTooltipProps {
}

export function Tooltip({ label, ...rest }: TooltipProps) {
  return (
    <CTooltip
      label={<Text fontSize="xs">{label}</Text>}
      {...rest}
    />
  );
}
