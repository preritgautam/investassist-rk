import React from 'react';
import { Box, Flex, FlexProps } from '@chakra-ui/react';

export interface FooterProps extends FlexProps {
  size?: number,
}

export function Footer({ size = 2, ...rest }: FooterProps) {
  return (
    <>
      <Box w="100%" h={`${size}rem`} flexShrink={0} />
      <Flex w="100%" h={`${size}rem`} position="fixed" bottom={0} {...rest}/>
    </>
  );
}
