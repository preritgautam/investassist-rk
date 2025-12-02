import React from 'react';

export function useBindCallback(func: Function, ...params) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return React.useCallback(() => func.call(null, ...params), [func, ...params]);
}

export function useBindCallbackWithEvent(func: Function, ...params) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return React.useCallback((e) => func.call(null, e, ...params), [func, ...params]);
}
