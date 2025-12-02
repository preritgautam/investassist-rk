import React from 'react';
import { NumericField, NumericFieldProps } from './NumericField';

interface PercentFieldProps extends NumericFieldProps {
}

export function PercentField(props: PercentFieldProps) {
  return (
    <NumericField inputRightAddOn="%" inputProps={{ min: 0, max: 100 }} {...props} />
  );
}
