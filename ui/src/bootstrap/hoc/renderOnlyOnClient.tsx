import { useIsVisible } from '../hooks/utils/useIsVisible';
import React from 'react';

export function renderOnlyOnClient<P extends object>(TheComponent: React.ComponentType<P>): React.FC<P> {
  function ClientOnlyComponent(props: P) {
    const [visible, show] = useIsVisible();
    React.useEffect(show);

    if (visible) {
      return <TheComponent {...props} />;
    }

    return <></>;
  }

  return ClientOnlyComponent;
}
