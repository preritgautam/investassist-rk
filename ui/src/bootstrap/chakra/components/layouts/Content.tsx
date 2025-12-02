import React from 'react';
import { Box, BoxProps } from '@chakra-ui/react';

export interface ContentProps extends BoxProps {

}

function Content({ ...rest }: ContentProps) {
  return (
    <Box w="100%" minH={0} display="flex" overflow="auto" {...rest} />
  );
}

export { Content };
