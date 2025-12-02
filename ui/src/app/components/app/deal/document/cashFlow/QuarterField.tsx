import { DateTime } from 'luxon';
import React, { useCallback } from 'react';
import { Flex, Select } from '@chakra-ui/react';

interface QuarterFieldProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  readonly: boolean;
}

export function QuarterField({ value, onChange, disabled, readonly }: QuarterFieldProps) {
  const date = DateTime.fromISO(value);
  const year = date.year;
  const quarter = Math.ceil(date.month / 3);

  const onQuarterChange = useCallback((e) => {
    const date = DateTime.utc(year, +e.target.value * 3).endOf('month');
    onChange(date.toISO().substring(0, 10));
  }, [year, onChange]);

  const onYearChange = useCallback((e) => {
    const date = DateTime.utc(+e.target.value, quarter * 3).endOf('month');
    onChange(date.toISO().substring(0, 10));
  }, [onChange, quarter]);

  return (
    <Flex>
      <Select
        value={quarter} onChange={onQuarterChange} minW={15} disabled={disabled} size="xs"
        isDisabled={readonly} color={readonly ? 'black' : undefined}
      >
        <option value={1}>Q1</option>
        <option value={2}>Q2</option>
        <option value={3}>Q3</option>
        <option value={4}>Q4</option>
      </Select>
      <Select
        onChange={onYearChange} value={year} minW={20} disabled={disabled} size="xs"
        isDisabled={readonly} color={readonly ? 'black' : undefined}
      >
        {new Array(40).fill(0).map((_, i) => (
          <option key={i} value={2020 + i - 20}>{2020 + i - 20}</option>
        ))}
      </Select>
    </Flex>
  );
}
