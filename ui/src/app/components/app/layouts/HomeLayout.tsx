import React, { ReactNode } from 'react';
import { Page } from '../../../../bootstrap/chakra/components/layouts/Page';
import { GetLayoutFunction } from '../../../../bootstrap/types';
import { Content } from '../../../../bootstrap/chakra/components/layouts/Content';
import Image from 'next/image';
import { Box } from '@chakra-ui/react';

export interface HomeLayoutProps {
  children: React.ReactNode,
}

export function HomeLayout({ children }: HomeLayoutProps) {
  return (
    <Page>
      <Box position="absolute" right={0} top={0} zIndex={-1}>
        <Image src="/assets/images/HomeBG1.svg" width={1000} height={525}/>
      </Box>
      <Box position="absolute" left="0" bottom={0} zIndex={-1}>
        <Image src="/assets/images/HomeBG2.svg" width={1200} height={553}/>
      </Box>
      <Content justifyContent="center" alignItems="start" zIndex={10}>
        {children}
      </Content>

    </Page>
  );
}

export const getHomeLayout: GetLayoutFunction =
  (pageContent: ReactNode) => <HomeLayout>{pageContent}</HomeLayout>;
