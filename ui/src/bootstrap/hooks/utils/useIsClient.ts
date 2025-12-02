import React from 'react';
import { useIsVisible } from './useIsVisible';

export function useIsClient(): boolean {
  const [visible, show] = useIsVisible();
  React.useEffect(show);
  return visible;
}
