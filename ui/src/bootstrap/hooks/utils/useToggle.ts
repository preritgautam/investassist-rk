import React from 'react';

export type UseToggleReturn = [boolean, () => void, (boolean) => void]

function useToggle(initialValue: boolean = false): UseToggleReturn {
  const [value, setValue] = React.useState(initialValue);
  const toggle = React.useCallback(() => setValue(!value), [value]);
  return [value, toggle, setValue];
}

export { useToggle };
