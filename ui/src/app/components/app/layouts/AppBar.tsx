import React, { ReactNode } from 'react';
import { appConfig } from '../../../../config';
import { Header, HeaderProps } from '../../../../bootstrap/chakra/components/layouts/Header';
import { HeadingS } from '../../../../bootstrap/chakra/components/typography';

export interface AppBarProps extends HeaderProps {
  children?: ReactNode,
}

function AppBar({ children, ...rest }: AppBarProps) {
  return (
    <Header bg="#222" align="center" p={2} boxShadow="lg" {...rest}>
      <HeadingS m={0} color="#ddd" flexGrow={0} flexShrink={0}>
        {appConfig.appName}
      </HeadingS>
      {children}
    </Header>
  );
}

AppBar.Memo = React.memo(AppBar);

export { AppBar };
