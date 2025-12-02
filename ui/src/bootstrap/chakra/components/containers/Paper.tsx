import React from 'react';
import { Box, BoxProps, useStyleConfig } from '@chakra-ui/react';

export interface PaperProps extends Omit<BoxProps, 'onSubmit'> {
  variant?: 'default' | 'hoverable' | 'hoverableRect';
  clickable?: boolean,
}

function Paper({ variant, clickable, ...rest }: PaperProps) {
  const styles = useStyleConfig('Paper', { variant });

  return (
    <Box __css={styles} cursor={clickable ? 'pointer' : undefined} {...rest}/>
  );
}

export { Paper };
