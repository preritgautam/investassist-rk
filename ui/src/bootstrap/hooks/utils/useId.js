import React from 'react';

export function useId() {
  const [id] = React.useState(`id-${Math.random()}`);
  return id;
}
