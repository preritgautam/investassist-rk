import React from 'react';
import { Box, BoxProps } from '@chakra-ui/react';

export interface PageProps extends BoxProps {

}

export function Page(props: PageProps) {
  return (
    <Box w="100vw" h="100vh" {...props} />
  );
}

export function FlexPage(props: PageProps) {
  return <Page display="flex" alignItems="stretch" {...props} />;
}

export function FlexColPage(props: PageProps) {
  return <Page display="flex" flexDir="column" alignItems="stretch" {...props} />;
}
