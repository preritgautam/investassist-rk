import React, { useMemo } from 'react';
import { Text, TextProps } from '@chakra-ui/react';

const amountFormatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

export interface AmountProps extends TextProps {
  amount: number;
}

export function Amount({ amount, ...rest }: AmountProps) {
  const amountStr = useMemo(() => amountFormatter.format(amount), [amount]);
  return <Text {...rest}>{amountStr}</Text>;
}


export interface NumericProps extends TextProps {
  value: number;
  decimalPlaces?: number;
  unit?: string;
}

export function Numeric({ value, decimalPlaces = 2, unit, ...rest }: NumericProps) {
  const formatter = new Intl.NumberFormat('en-US', {
    minimumIntegerDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
  });
  return <Text {...rest}>{formatter.format(value)}{unit}</Text>;
}
