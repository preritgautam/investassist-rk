import React, { Component, useMemo } from 'react';
import { Flex, Select, SelectProps } from '@chakra-ui/react';

type Size = string;

export interface DatePickerProps {
  value?: Date,
  onChange?: (value: Date) => void,
  ref?: React.Ref<DatePicker>,
  onBlur?: () => void,
  minDate?: Date,
  maxDate?: Date,
  size?: Size,
}

export interface DatePickerState {
}

const MonthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

interface MonthsProps extends SelectProps {
}

function Months(props: MonthsProps) {
  return (
    <Select {...props}>
      {MonthNames.map((name, index) => (
        <option key={name} value={index + 1}>{name}</option>
      ))}
    </Select>
  );
}

interface YearsProps extends SelectProps {
  min: number,
  max: number,
}

function Years({ min, max, ...rest }: YearsProps) {
  const yearsList = useMemo(() => new Array(max - min).fill(0), [min, max]);
  return (
    <Select {...rest}>
      {yearsList.map((_, y) => (
        <option value={y + min} key={y}>{y + min}</option>
      ))}
    </Select>
  );
}

export class DatePicker extends Component<DatePickerProps, DatePickerState> {
  static defaultProps = {
    minDate: new Date(1950, 1, 15),
    maxDate: new Date(2050, 12, 15),
    size: 'sm',
  };

  state = {};

  render() {
    const minYear = this.props.minDate.getFullYear();
    const maxYear = this.props.maxDate.getFullYear();

    return (
      <Flex direction="column" align="stretch">
        <Flex justify="space-between">
          <Months size={this.props.size}/>
          <Years size={this.props.size} min={minYear} max={maxYear}/>
        </Flex>
      </Flex>
    );
  }
}
