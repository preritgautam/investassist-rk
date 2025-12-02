import {
  AccountingFormatIcon,
  MenuDownFillIcon,
  CurrencyFormatIcon,
  FractionFormatIcon,
  GeneralFormatIcon,
  LongDateFormatIcon,
  NumberFormatIcon,
  PercentFormatIcon,
  ScientificFormatIcon,
  ShortDateFormatIcon,
  TextFormatIcon,
  TimeFormatIcon,
} from '../../app/icons';
import React from 'react';
import { ACTIONS } from './SpreadSheetToolbar';
import { BodyS } from '../../../../bootstrap/chakra/components/typography';
import { Menu, MenuButton, MenuItem, MenuList, Text } from '@chakra-ui/react';
import { SpreadSheetToolbarButton } from './SpreadSheetToolbarButton';

export const FORMATS = {
  GENERAL: '',
  NUMBER: '#,##0.00_);(#,##0.00)',
  CURRENCY: '$#,##0.00',
  ACCOUNTING: '_($* #,##0.00_);_($* (#,##0.00);_($* \'-\'??_);_(@_)',
  SHORT_DATE: 'm/d/yyyy',
  LONG_DATE: 'dddd, mmmm dd, yyyy',
  TIME: 'h:mm:ss AM/PM',
  PERCENTAGE: '0%',
  SCIENTIFIC: '0.00E+00',
  FRACTION: '# ?/?',
  TEXT: '@',
};


export interface FormatMenuButtonProps {
  onSelect: (action: number, { format }: { format: string }) => void,
}

export function FormatMenuButton({ onSelect }: FormatMenuButtonProps) {
  return (
    <Menu>
      <MenuButton
        as={SpreadSheetToolbarButton} title="Change Cell Format" icon={MenuDownFillIcon}
      >
        <Text>123</Text>
      </MenuButton>
      <MenuList>
        <MenuItem
          onClick={() => onSelect(ACTIONS.FORMAT_CELL, { format: FORMATS.GENERAL })}
          icon={<GeneralFormatIcon className="my-1" size={16}/>}
        ><BodyS className="my-1">General</BodyS></MenuItem>
        <MenuItem
          onClick={() => onSelect(ACTIONS.FORMAT_CELL, { format: FORMATS.NUMBER })}
          icon={<NumberFormatIcon className="my-1" size={16}/>}
        ><BodyS className="my-1">Number</BodyS></MenuItem>
        <MenuItem
          onClick={() => onSelect(ACTIONS.FORMAT_CELL, { format: FORMATS.CURRENCY })}
          icon={<CurrencyFormatIcon className="my-1" size={16}/>}
        ><BodyS className="my-1">Currency</BodyS></MenuItem>
        <MenuItem
          onClick={() => onSelect(ACTIONS.FORMAT_CELL, { format: FORMATS.ACCOUNTING })}
          icon={<AccountingFormatIcon className="my-1" size={16}/>}
        ><BodyS className="my-1">Accounting</BodyS></MenuItem>
        <MenuItem
          onClick={() => onSelect(ACTIONS.FORMAT_CELL, { format: FORMATS.SHORT_DATE })}
          icon={<ShortDateFormatIcon className="my-1" size={16}/>}
        ><BodyS className="my-1">Short date</BodyS></MenuItem>
        <MenuItem
          onClick={() => onSelect(ACTIONS.FORMAT_CELL, { format: FORMATS.LONG_DATE })}
          icon={<LongDateFormatIcon className="my-1" size={16}/>}
        ><BodyS className="my-1">Long date</BodyS></MenuItem>
        <MenuItem
          onClick={() => onSelect(ACTIONS.FORMAT_CELL, { format: FORMATS.TIME })}
          icon={<TimeFormatIcon className="my-1" size={16}/>}
        ><BodyS className="my-1">Time</BodyS></MenuItem>
        <MenuItem
          onClick={() => onSelect(ACTIONS.FORMAT_CELL, { format: FORMATS.PERCENTAGE })}
          icon={<PercentFormatIcon className="my-1" size={16}/>}
        ><BodyS className="my-1">Percentage</BodyS></MenuItem>
        <MenuItem
          onClick={() => onSelect(ACTIONS.FORMAT_CELL, { format: FORMATS.FRACTION })}
          icon={<FractionFormatIcon className="my-1" size={16}/>}
        ><BodyS className="my-1">Fraction</BodyS></MenuItem>
        <MenuItem
          onClick={() => onSelect(ACTIONS.FORMAT_CELL, { format: FORMATS.SCIENTIFIC })}
          icon={<ScientificFormatIcon className="my-1" size={16}/>}
        ><BodyS className="my-1">Scientific</BodyS></MenuItem>
        <MenuItem
          onClick={() => onSelect(ACTIONS.FORMAT_CELL, { format: FORMATS.TEXT })}
          icon={<TextFormatIcon className="my-1" size={16}/>}
        ><BodyS className="my-1">Text</BodyS></MenuItem>
      </MenuList>
    </Menu>
  );
}
