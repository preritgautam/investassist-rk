import React, { SyntheticEvent } from 'react';

export function useStopPropagationCallback(callback: (e: SyntheticEvent) => any): (e: SyntheticEvent) => any {
  return React.useCallback((e) => {
    e.stopPropagation();
    return callback(e);
  }, [callback]);
}
