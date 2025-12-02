import { Input, InputProps } from '@chakra-ui/react';
import React, { useCallback, useEffect, useState } from 'react';

interface ChargeCodeFieldProps extends Omit<InputProps, 'value' | 'onChange'> {
  value: string;
  onChange: (value: string) => void;
}

export function ChargeCodeField({ onChange, value, ...rest }: ChargeCodeFieldProps) {
  const [val, setVal] = useState<string>();
  useEffect(() => {
    setVal(value);
  }, [value]);

  const handleChange = useCallback((e) => setVal(e.target.value), []);

  const handleBlur = useCallback(() => onChange(val), [val, onChange]);
  const stopEvent = useCallback((e) => {
    e.stopPropagation();
    // e.preventDefault();
  }, []);

  return <Input {...rest} value={val} onChange={handleChange} onBlur={handleBlur} onMouseDown={stopEvent}/>;
}
