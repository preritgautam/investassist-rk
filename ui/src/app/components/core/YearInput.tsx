import React, { useMemo, forwardRef, ForwardedRef } from 'react';
import { Select, SelectProps } from '@chakra-ui/react';
import { DateTime } from 'luxon';

export interface YearInputProps extends SelectProps {
  minValue?: number;
  maxValue?: number;
  optional?: boolean;
}

export const YearInput = forwardRef(function YearInput(
  { minValue, maxValue, optional, ...selectProps }: YearInputProps, ref: ForwardedRef<HTMLSelectElement>,
) {
  const min = minValue ?? DateTime.now().year - 5;
  const max = maxValue ?? min + 10;
  const count = max - min + 1;

  const values = useMemo(() => (new Array(count).fill(0).map((_, i) => i + min)), [count, min]);

  return (
    <Select ref={ref} {...selectProps}>
      {optional && (
        <option value="">-Select-</option>
      )}
      {values.map((value) => (
        <option key={value.toString()} value={value.toString()}>{value}</option>
      ))}
    </Select>
  );
});
