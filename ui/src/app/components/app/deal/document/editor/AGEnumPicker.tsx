import React, { ForwardedRef, forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { ICellEditorReactComp } from 'ag-grid-react';
import { ICellEditorParams } from 'ag-grid-community';
import { Select } from '@chakra-ui/react';
import { Enum, EnumType } from '../../../../../../bootstrap/utils/Enum';
import { useClickAway } from 'react-use';

export interface AGEnumPickerProps extends ICellEditorParams {
  enumType: EnumType;
}

export const AGEnumPicker = forwardRef(
  function AGEnumPicker(
    { value: originalValue, stopEditing, enumType }: AGEnumPickerProps,
    ref: ForwardedRef<ICellEditorReactComp>,
  ) {
    const refSelect = useRef<HTMLSelectElement>();
    const [value, setValue] = useState(originalValue);

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
        // the final value to send to the grid, on completion of editing
        getValue() {
          // this simple editor doubles any value entered into the input
          return value;
        },
      };
    });

    const handleChange = useCallback(async (e) => {
      setValue(e.target.value);
      process.nextTick(() => stopEditing());
    }, [stopEditing]);

    const options = enumType.all();

    const handleKeyPress = useCallback(async (e) => {
      if (e.code === 'Delete' || e.code === 'Backspace') {
        setValue('');
      }
      if (e.code === 'KeyC' && navigator.clipboard) {
        await navigator.clipboard.writeText(e.target.value);
      }
      if (e.code === 'KeyV' && navigator.clipboard) {
        const text = await navigator.clipboard.readText();
        if (!!text && typeof text === 'string' && enumType.all().map((k) => k.key).includes(text)) {
          setValue(text);
        }
      }
    }, [enumType]);

    return (
      <Select
        ref={refSelect} value={value} onChange={handleChange}
        style={{ width: '100%' }} size="xs" onKeyDown={handleKeyPress}
      >
        <option value="">-Select-</option>
        {options.map((e: Enum) => (
          <option value={e.key} key={e.key}>{e.label}</option>
        ))}
      </Select>
    );
  },
);
