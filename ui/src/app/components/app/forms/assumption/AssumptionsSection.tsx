import { Card, CardProps } from '../../../core/Card';
import { Heading } from '@chakra-ui/react';
import React, { ReactNode } from 'react';

interface AssumptionsSectionProps extends CardProps {
  title: string,
  children: ReactNode,
}

export function AssumptionsSection({ title, children, ...rest }: AssumptionsSectionProps) {
  return (
    <Card flexDir="column" border="1px solid" borderColor="border.500" rounded="sm" {...rest}>
      <Heading size="xs" mb={4}>{title}</Heading>
      {children}
    </Card>
  );
}
