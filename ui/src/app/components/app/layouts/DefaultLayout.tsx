import React, { ReactNode } from 'react';
import { Page } from '../../../../bootstrap/chakra/components/layouts/Page';
import { GetLayoutFunction } from '../../../../bootstrap/types';
import { AppBar } from './AppBar';
import { AppFooter } from './AppFooter';
import { Content } from '../../../../bootstrap/chakra/components/layouts/Content';

export interface DefaultLayoutProps {
  children: React.ReactNode,
}

export function DefaultLayout({ children }: DefaultLayoutProps) {
  return (
    <Page>
      <AppBar/>
      <Content justifyContent="center" alignItems="start">
        {children}
      </Content>
      <AppFooter/>
    </Page>
  );
}

export const getDefaultLayout: GetLayoutFunction =
  (pageContent: ReactNode) => <DefaultLayout>{pageContent}</DefaultLayout>;
