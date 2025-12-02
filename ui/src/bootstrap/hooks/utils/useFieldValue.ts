import React from 'react';
import { identity } from '../../utils/noop';

export interface UseFieldValueProps {
  transform?: (any: any) => any,
  defaultValue?: any,
  targetPropName?: string,
}

export type UseFieldValueReturn = [any, (ChangeEvent) => void, (value: any) => void]

export function useFieldValue(
  { transform = identity, defaultValue = '', targetPropName = 'value' }: UseFieldValueProps = {},
): UseFieldValueReturn {
  const [value, setValue] = React.useState(defaultValue);

  const handleChange = React.useCallback((e) => {
    const val = e.detail ? e.detail.value : e.target ? e.target[targetPropName] : e;
    if (val !== undefined) {
      setValue(transform(val));
    }
  }, [transform, targetPropName]);

  return [value, handleChange, setValue];
}
