import { Select, SelectProps } from '@chakra-ui/react';
import { XLSheet } from '../../../filePreview/XlsxPreview';
import React from 'react';

interface XlsxSheetSelectorProps extends SelectProps {
  sheets: XLSheet[];
  activeSheetValue: number;
  onSheetChange: (sheetValue: number) => void,
}

export function XlsxSheetSelector({ sheets, activeSheetValue, onSheetChange, ...rest }: XlsxSheetSelectorProps) {
  return (
    <Select onChange={(e) => onSheetChange(+e.target.value)} value={activeSheetValue} {...rest}>
      {sheets.map((sheet: XLSheet) => (
        <option key={sheet.label} value={sheet.value}>{sheet.label}</option>
      ))}
    </Select>
  );
}
