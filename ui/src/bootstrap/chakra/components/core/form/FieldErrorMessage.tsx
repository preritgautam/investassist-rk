import React from 'react';
import { BodyXS } from '../../typography';

export interface FieldErrorProps {
  error?: {
    message?: string,
  }
}

export function FieldErrorMessage({ error }: FieldErrorProps) {
  if (!error) {
    return <></>;
  }

  return (
    <BodyXS mt={2} color="danger.500">{error.message || 'The value is incorrect'}</BodyXS>
  );
}
