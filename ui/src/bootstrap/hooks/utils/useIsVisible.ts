import React from 'react';


export type UseIsVisibleReturn = [boolean, () => void, () => void, (boolean) => void, () => void]

export function useIsVisible(initialVisible = false): UseIsVisibleReturn {
  const [visible, setVisible] = React.useState(initialVisible);

  const show = React.useCallback(() => setVisible(true), []);
  const hide = React.useCallback(() => setVisible(false), []);
  const toggle = React.useCallback(() => setVisible(!visible), [visible]);

  return [visible, show, hide, setVisible, toggle];
}
