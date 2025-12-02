import { DateTime, DateTimeFormatOptions } from 'luxon';
import React from 'react';
import { Text, TextProps } from '@chakra-ui/react';

export interface DateCellRendererProps {
  value: string,
  format?: DateTimeFormatOptions,
  textProps?: TextProps
}

export function DateCellRenderer({ value, format, textProps = {} }: DateCellRendererProps) {
  return (
    <Text fontSize="sm" {...textProps}>{DateTime.fromISO(value).toLocaleString(format)}</Text>
  );
}

export interface ShortDateCellRendererProps {
  value: string,
  textProps?: TextProps
}

export function ShortDateCellRenderer({ value, textProps }: ShortDateCellRendererProps) {
  return <DateCellRenderer value={value} format={DateTime.DATETIME_SHORT} textProps={textProps}/>;
}
