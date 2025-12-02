import React, {
  ForwardedRef,
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { ICellEditorParams } from 'ag-grid-community';
import { ICellEditorReactComp } from 'ag-grid-react';
import { isoToMmddyyyy, mmddyyyyToISO } from '../../../../../services/utils/utils';
import { DateTime } from 'luxon';

export interface AGDatePickerProps extends ICellEditorParams {
}

export const AGDatePicker = forwardRef(
  function AGDatePicker(props: AGDatePickerProps, ref: ForwardedRef<ICellEditorReactComp>) {
    const originalValueDump = useMemo(() => props.value, [props.value]);
    const [value, setValue] = useState(mmddyyyyToISO(props.value, false));
    const refInput = useRef(null);

    useEffect(() => {
      // focus on the input
      refInput.current.focus();
    }, []);

    /* Component Editor Lifecycle methods */
    useImperativeHandle(ref, () => {
      return {
        // the final value to send to the grid, on completion of editing
        getValue() {
          return value === '' ? value : isoToMmddyyyy(value) || originalValueDump;
        },
      };
    });

    const handleKeyPress = useCallback(async (e) => {
      if (e.code === 'Delete' || e.code === 'Backspace') {
        setValue('');
      }
      if (e.code === 'KeyC' && navigator.clipboard) {
        await navigator.clipboard.writeText(e.target.value);
      }
      if (e.code === 'KeyV' && navigator.clipboard) {
        const text = await navigator.clipboard.readText();
        const dateTime = DateTime.fromFormat(text, 'yyyy-mm-dd');
        if (dateTime.isValid) {
          setValue(dateTime.toFormat('mm/dd/yyyy'));
        }
      }
    }, []);

    return (
      <input
        type="date" ref={refInput} value={value} onChange={(event) => setValue(event.target.value)}
        style={{ width: '100%' }} onKeyDown={handleKeyPress}
      />
    );
  },
);
