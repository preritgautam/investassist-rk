import React from 'react';
import { Flex, FlexProps, useStyleConfig } from '@chakra-ui/react';

export interface CardProps extends FlexProps {
}

export function Card({ children, ...rest }: CardProps) {
  const styles = useStyleConfig('Card');

  return (
    <Flex __css={styles} rounded="sm" {...rest}>
      {children}
    </Flex>
  );
}
