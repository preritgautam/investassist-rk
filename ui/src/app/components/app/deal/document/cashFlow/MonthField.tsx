import { DateTime } from 'luxon';
import React, { useCallback } from 'react';
import { Flex, Select } from '@chakra-ui/react';

interface MonthFieldProps {
  value: string;
  onChange: (periodEndDate: string) => void;
  disabled?: boolean;
  readonly: boolean;
}

export function MonthField({ value, onChange, disabled, readonly }: MonthFieldProps) {
  const date = DateTime.fromISO(value);
  const year = date.year;
  const month = date.month;

  const onMonthChange = useCallback((e) => {
    const date = DateTime.utc(year, +e.target.value).endOf('month');
    onChange(date.toISO().substring(0, 10));
  }, [year, onChange]);

  const onYearChange = useCallback((e) => {
    const date = DateTime.utc(+e.target.value, month).endOf('month');
    onChange(date.toISO().substring(0, 10));
  }, [onChange, month]);

  return (
    <Flex>
      <Select
        value={month} onChange={onMonthChange} disabled={disabled} size="xs"
        isDisabled={readonly} color={readonly ? 'black' : undefined}
      >
        <option value={1}>Jan</option>
        <option value={2}>Feb</option>
        <option value={3}>Mar</option>
        <option value={4}>Apr</option>
        <option value={5}>May</option>
        <option value={6}>Jun</option>
        <option value={7}>Jul</option>
        <option value={8}>Aug</option>
        <option value={9}>Sep</option>
        <option value={10}>Oct</option>
        <option value={11}>Nov</option>
        <option value={12}>Dec</option>
      </Select>
      <Select
        onChange={onYearChange} value={year} disabled={disabled} size="xs"
        isDisabled={readonly} color={readonly ? 'black' : undefined}
      >
        {new Array(40).fill(0).map((_, i) => (
          <option key={i} value={2020 + i - 20}>{2020 + i - 20}</option>
        ))}
      </Select>
    </Flex>
  );
}
