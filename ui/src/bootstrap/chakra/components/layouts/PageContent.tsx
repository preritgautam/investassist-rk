import React from 'react';
import { HeadingL } from '../typography';
import { Divider, Flex } from '@chakra-ui/react';
import { FlexCol, FlexColProps } from './FlexCol';

export interface PageContentProps extends FlexColProps {
  pageTitle: React.ReactNode,
  children?: React.ReactNode,
  mainActionButton?: React.ReactNode,
  noDivider?: boolean,
}

export function PageContent({ pageTitle, children, mainActionButton = null, noDivider, ...rest }: PageContentProps) {
  return (
    <FlexCol pt={6} px={6} pb={0} align="stretch" w="100%" h="100%" {...rest}>
      <Flex justify="space-between" align="center">
        <HeadingL>{pageTitle}</HeadingL>
        {mainActionButton}
      </Flex>
      {!noDivider && <Divider my={6} mx={-6} w="auto"/>}
      {children}
    </FlexCol>
  );
}
