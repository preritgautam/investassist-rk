import React, { ForwardedRef, forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { ICellEditorReactComp } from 'ag-grid-react';
import { ICellEditorParams } from 'ag-grid-community';
import { Select } from '@chakra-ui/react';
import { useClickAway } from 'react-use';

export interface AGBooleanPickerProps extends ICellEditorParams {
}

export const AGBooleanPicker = forwardRef(
  function AGBooleanPicker(
    { value: originalValue, stopEditing }: AGBooleanPickerProps,
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

    const handleKeyPress = useCallback(async (e) => {
      if (e.code === 'Delete' || e.code === 'Backspace') {
        setValue('');
      }
      if (e.code === 'KeyC' && navigator.clipboard) {
        await navigator.clipboard.writeText(e.target.value);
      }
      if (e.code === 'KeyV' && navigator.clipboard) {
        const text = await navigator.clipboard.readText();
        if (!!text && typeof text === 'string' && ['Yes', 'No'].includes(text)) {
          setValue(text);
        }
      }
    }, []);

    return (
      <Select
        ref={refSelect} value={value} onChange={handleChange}
        style={{ width: '100%' }} size="xs" onKeyDown={handleKeyPress}
      >
        <option value="">-Select-</option>
        <option value="Yes">Yes</option>
        <option value="No">No</option>
      </Select>
    );
  },
);
