import React from 'react';
import { Box, BoxProps, useStyleConfig } from '@chakra-ui/react';

export interface SideBarProps extends BoxProps {
  variant?: 'shadowRight';
}

function Sidebar({ variant, ...rest }: SideBarProps) {
  const styles = useStyleConfig('Sidebar', { variant });

  return (
    <Box h="100%" alignSelf="stretch" flexShrink={0} __css={styles} {...rest} />
  );
}

export { Sidebar };
