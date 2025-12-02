import React, { useCallback, useMemo } from 'react';
import { Flex, FlexProps, Select } from '@chakra-ui/react';
import { DateTime } from 'luxon';
import { Control, Controller } from 'react-hook-form';
import { RegisterOptions } from 'react-hook-form/dist/types/validator';

export interface ISOMonthProps extends Omit<FlexProps, 'onChange' | 'onBlur'> {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  isDisabled?: boolean;
  minYear?: number;
  maxYear?: number;
}

const currentYear = (new Date()).getFullYear();
const defaultMinYear = currentYear - 10;
const defaultMaxYear = currentYear;
const Months = ['-Select-', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function ISOMonth(
  { value, onChange, isDisabled, onBlur, minYear = defaultMinYear, maxYear = defaultMaxYear, ...rest }: ISOMonthProps,
) {
  const date = DateTime.fromISO(value);
  const year = date.year;
  const month = date.month;

  const handleMonthChange = useCallback((e) => {
    onChange(DateTime.utc(year, +e.target.value).toFormat('yyyy-MM'));
  }, [onChange, year]);

  const handleYearChange = useCallback((e) => {
    onChange(DateTime.utc(+e.target.value, month).toFormat('yyyy-MM'));
  }, [onChange, month]);

  const yearCount = maxYear - minYear;
  const dummyArray = useMemo(() => (new Array(yearCount).fill(0)), [yearCount]);

  return (
    <Flex {...rest}>
      <Select flexShrink={0} value={month} onChange={handleMonthChange}>
        {Months.map((label, value) => (
          <option key={label} value={value}>{label}</option>
        ))}
      </Select>
      <Select flexShrink={0} value={year} onChange={handleYearChange} onBlur={onBlur}>
        {dummyArray.map((_, index) => {
          const value = index + minYear;
          return (
            <option key={value} value={value}>{value}</option>
          );
        })}
      </Select>
    </Flex>
  );
}

export interface FormISOMonthProps extends ISOMonthProps {
  name: string;
  control: Control;
  rules?: RegisterOptions;
}

export function FormISOMonth({ name, control, rules, ...rest }: FormISOMonthProps) {
  return (
    <Controller
      control={control} name={name} rules={rules}
      render={({ field: { onChange, onBlur, value, ref } }) => (
        <ISOMonth value={value} onChange={onChange} onBlur={onBlur} {...rest} />
      )}
    />
  );
}
