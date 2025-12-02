import { Button, ButtonProps, chakra } from '@chakra-ui/react';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';

interface FileButtonProps extends ButtonProps {
  resetAfterSelect?: boolean,
  onFileSelect: (data: string | File | ArrayBuffer) => void,
  format?: 'file' | 'dataUrl' | 'arrayBuffer'
}

export function FileButton({ resetAfterSelect, onFileSelect, format = 'file', ...rest }: FileButtonProps) {
  const inputRef = useRef<HTMLInputElement>();
  const reader = useMemo(() => new FileReader(), []);

  useEffect(() => {
    const onLoad = () => onFileSelect(reader.result);
    reader.addEventListener('load', onLoad);
    return () => reader.removeEventListener('load', onLoad);
  }, [onFileSelect, reader]);

  const handleChange = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      if (format === 'file') {
        onFileSelect(file);
      } else if (format === 'dataUrl') {
        reader.readAsDataURL(file);
      } else {
        reader.readAsArrayBuffer(file);
      }

      if (resetAfterSelect) {
        inputRef.current.value = null;
      }
    }
  }, [format, reader, resetAfterSelect, onFileSelect]);

  return (
    <>
      <chakra.input type="file" display="none" ref={inputRef} onChange={handleChange}/>
      <Button size="md" onClick={() => inputRef.current?.click()} {...rest} />
    </>
  );
}
