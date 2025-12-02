import React from 'react';
import { NumericField, NumericFieldProps } from './NumericField';

export interface YearsFieldProps extends NumericFieldProps {
}

export function YearsField(props: YearsFieldProps) {
  return (
    <NumericField inputRightAddOn="Years" {...props} />
  );
}
