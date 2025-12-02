import React, { ForwardedRef, forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { ICellEditorReactComp } from 'ag-grid-react';
import { ICellEditorParams } from 'ag-grid-community';
import { Select } from '@chakra-ui/react';
import { CFDataRow } from '../../../../../../types';
import { useClickAway } from 'react-use';
import { useAccountCOA } from '../../../../../context/AccountCoaContext';

export interface AGHeadCategoryPickerProps extends ICellEditorParams {
  data: CFDataRow,
}

export const AGHeadCategoryPicker = forwardRef(
  function AGHeadCategoryPicker(
    { value: originalValue, stopEditing, data: row, eventKey }: AGHeadCategoryPickerProps,
    ref: ForwardedRef<ICellEditorReactComp>,
  ) {
    const refSelect = useRef<HTMLSelectElement>();
    const headCat = `${row.head} | ${row.category}`;
    const [value, setValue] = useState(headCat);
    const { coaObj } = useAccountCOA();

    useClickAway(refSelect, () => {
      stopEditing();
    });

    useEffect(() => {
      // focus on the input
      refSelect.current.focus();
    }, []);

    /* Component Editor Lifecycle methods */
    useImperativeHandle(ref, () => {
      return {
        getValue() {
          return value;
        },
        isCancelBeforeStart(): boolean {
          return ['Delete', 'Backspace'].includes(eventKey);
        },
        isCancelAfterEnd(): boolean {
          return value === headCat;
        },
      };
    }, [eventKey, headCat, value]);

    const handleChange = useCallback((e) => {
      setValue(e.target.value);
      process.nextTick(() => stopEditing());
    }, [stopEditing]);

    const handleKeyPress = useCallback(async (e) => {
      if (e.code === 'Delete' || e.code === 'Backspace') {
        setValue('');
      }
      if (e.code === 'KeyC' && navigator.clipboard) {
        await navigator.clipboard.writeText(headCat);
      }
      if (e.code === 'KeyV' && navigator.clipboard) {
        const text = await navigator.clipboard.readText();
        if (!!text && typeof text === 'string' && text.includes('|')) {
          const val = text.split('|');
          if (Reflect.ownKeys(coaObj).includes(val[0].trim()) &&
            coaObj[val[0].trim()].includes(val[1].trim())) {
            setValue(text);
          }
        }
      }
    }, [coaObj, headCat]);

    return (
      <Select
        ref={refSelect} value={value} onChange={handleChange}
        style={{ width: '100%' }} size="xs" onKeyDown={handleKeyPress}
      >
        <option value="">-Select-</option>
        {Reflect.ownKeys(coaObj).map((head: string) => (
          <optgroup key={head} label={head}>
            {coaObj[head].map((category) => (
              <option key={`${head} | ${category}`} value={`${head} | ${category}`}>{category}</option>
            ))}
          </optgroup>
        ))}
      </Select>
    );
  },
);
