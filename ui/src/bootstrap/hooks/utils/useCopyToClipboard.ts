import copy from 'copy-to-clipboard';
import * as React from 'react';

export interface UseCopyToClipboardReturn {
  copyText: (string) => void,
}

export function useCopyToClipboard(): UseCopyToClipboardReturn {
  const copyText = React.useCallback((text) => {
    setTimeout(() => copy(text), 0);
  }, []);

  return { copyText };
}
