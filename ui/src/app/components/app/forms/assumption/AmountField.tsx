import React from 'react';
import { NumericField, NumericFieldProps } from './NumericField';

export interface AmountFieldProps extends NumericFieldProps {
}

export function AmountField(props: AmountFieldProps) {
  return (
    <NumericField inputLeftAddOn="$" {...props} />
  );
}
