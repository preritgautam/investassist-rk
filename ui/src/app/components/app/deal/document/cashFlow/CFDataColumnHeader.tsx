import { Checkbox, Flex, Icon, IconButton, Select, Text, VStack } from '@chakra-ui/react';
import { DateTime } from 'luxon';
import { MonthField } from './MonthField';
import { QuarterField } from './QuarterField';
import React, { useCallback, useEffect, useRef } from 'react';
import { CFDataColumn } from '../../../../../../types';
import { ColumnMenuIcon } from '../../../icons';
import { IHeaderParams } from 'ag-grid-community';

interface CFDataColumnHeaderProps extends IHeaderParams {
  value: CFDataColumn;
  onChange: (value: CFDataColumn) => void;
  readonly: boolean;
}

export function CFDataColumnHeader(
  {
    value,
    onChange,
    // onAddColumnBefore,
    // onAddColumnAfter,
    // onDeleteColumn,
    enableMenu,
    showColumnMenu,
    column,
    readonly,
  }: CFDataColumnHeaderProps,
) {
  const { type, period, periodEndDate, key, discard } = value;
  const typeIsTotal = ['actual-total'].indexOf(type) !== -1;
  const periodIsTotal = ['yearly', 'ytd', 'ttm'].indexOf(period) !== -1;
  const isOthers = type === 'others';

  const handleTypeChange = (e) => {
    const typeIsTotal2 = ['actual-total'].indexOf(e.target.value) !== -1;

    if (typeIsTotal2 === typeIsTotal) {
      onChange({
        ...value,
        type: e.target.value,
      });
    } else {
      if (typeIsTotal2) {
        // change period end date to end of year
        const periodEndDate2 = DateTime.fromISO(periodEndDate).endOf('year').toISODate();
        if (!periodIsTotal) {
          onChange({
            ...value,
            type: e.target.value,
            period: 'yearly',
            periodEndDate: periodEndDate2,
          });
        }
      } else {
        if (periodIsTotal) {
          onChange({
            ...value,
            type: e.target.value,
            period: 'monthly',
          });
        }
      }
    }
  };

  const handlePeriodChange = (e) => onChange({ ...value, period: e.target.value });
  const handleYearChange = (e) => onChange({ ...value, periodEndDate: `${e.target.value}-12-31` });
  const handlePeriodEndDateChange = (periodEndDate) => onChange({ ...value, periodEndDate: periodEndDate });
  const handleDiscard = (e) => onChange({ ...value, discard: !e.target.checked });
  const colName = `Column ${parseInt(key.substring(3)) + 1}`;

  const filterButtonRef = useRef(null);
  const handleFilter = useCallback(() => {
    showColumnMenu(filterButtonRef.current);
  }, [filterButtonRef, showColumnMenu]);

  const isFilterActive = column.isFilterActive();

  useEffect(() => {
    if (period === null) {
      onChange({ ...value, period: 'yearly' });
    }
    if (!isOthers && !type.includes('actual')) {
      onChange({ ...value, type: 'others' });
    }
  }, [period, value, onChange, isOthers, type]);

  return (
    <VStack alignItems="stretch" spacing={0} w="100%">
      <Flex justify="space-between" mb={1}>
        <Checkbox
          isChecked={!discard} onChange={handleDiscard} size="sm"
          isReadOnly={readonly} colorScheme={readonly ? 'gray' : 'primary'}
        >
          <Text color={discard ? 'gray.300' : undefined} fontSize="xs">{colName}</Text>
        </Checkbox>
        <Flex>
          {enableMenu && (
            <IconButton
              ref={filterButtonRef} onClick={handleFilter}
              variant="ghost" size="xs" aria-label="column filter"
              icon={<Icon as={ColumnMenuIcon} fontSize={10}/>}
              colorScheme={isFilterActive ? 'warning' : 'gray'}
              isActive={isFilterActive}
            />
          )}
        </Flex>
      </Flex>
      <Select
        value={type} onChange={handleTypeChange} disabled={discard || readonly} size="xs"
        color={readonly ? 'black' : undefined}
      >
        <option value="actual">Actual</option>
        <option value="actual-total">Actual Total</option>
        <option value="others">Others</option>
      </Select>

      <Select
        value={period ?? undefined} onChange={handlePeriodChange} disabled={discard || readonly} size="xs"
        color={readonly ? 'black' : undefined} visibility={isOthers ? 'hidden' : 'visible'}
      >
        {typeIsTotal && !isOthers && (
          <>
            <option value="yearly">Yearly</option>
            <option value="ytd">YTD</option>
            <option value="ttm">TTM</option>
          </>
        )}
        {!typeIsTotal && !isOthers && (
          <>
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
          </>
        )}
      </Select>

      {!isOthers && (period === 'yearly' || period === null) && (
        <Select
          onChange={handleYearChange} value={DateTime.fromISO(periodEndDate).year}
          disabled={discard || readonly || isOthers} size="xs" color={readonly ? 'black' : undefined}
        >
          {new Array(40).fill(0).map((_, i) => (
            <option key={i} value={2020 + i - 20}>{2020 + i - 20}</option>
          ))}
        </Select>
      )}

      {!isOthers && (period === 'monthly' || period === 'ytd' || period === 'ttm') && (
        <MonthField value={periodEndDate} onChange={handlePeriodEndDateChange} disabled={discard} readonly={readonly}/>
      )}

      {!isOthers && (period === 'quarterly') && (
        <QuarterField
          value={periodEndDate} onChange={handlePeriodEndDateChange} disabled={discard || typeIsTotal}
          readonly={readonly}
        />
      )}

      {isOthers && (
        <Select size="xs" disabled visibility="hidden"></Select>
      )}
    </VStack>
  );
}
