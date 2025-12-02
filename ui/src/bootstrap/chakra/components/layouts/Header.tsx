import React from 'react';
import { Box, Flex, FlexProps } from '@chakra-ui/react';

export interface HeaderProps extends FlexProps {
  size?: number,
}

export function Header({ size = 3, ...rest }: HeaderProps) {
  return (
    <>
      <Flex w="100%" h={`${size}rem`} position="fixed" {...rest} flexGrow={0} flexShrink={0}/>
      <Box w="100%" h={`${size}rem`} flexShrink={0} flexGrow={0}/>
    </>
  );
}
