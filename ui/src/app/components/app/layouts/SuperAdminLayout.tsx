import React from 'react';
import { useValidateSuperAdminSession } from '../../../hooks/auth/useValidateSession';
import { useSuperAdminLogout } from '../../../hooks/auth/useLogout';
import { Page } from '../../../../bootstrap/chakra/components/layouts/Page';
import { AppBar } from './AppBar';
import { Button } from '@chakra-ui/react';
import { Content } from '../../../../bootstrap/chakra/components/layouts/Content';
import { Paper } from '../../../../bootstrap/chakra/components/containers/Paper';
import { Sidebar } from '../../../../bootstrap/chakra/components/layouts/sidebar/Sidebar';
import { SidebarNavigation } from '../../../../bootstrap/chakra/components/layouts/sidebar/SidebarNavigation';
import { FlexCol } from '../../../../bootstrap/chakra/components/layouts/FlexCol';
import { AppFooter } from './AppFooter';
import { GetLayoutFunction } from '../../../../bootstrap/types';
import { HomeIcon } from '../../../../bootstrap/chakra/components/icons';
import { AccountsIcon, DealsIcon } from '../icons';


export interface AdminLayoutProps {
  children: React.ReactNode,
}

export function SuperAdminLayout({ children }: AdminLayoutProps) {
  useValidateSuperAdminSession();
  const handleLogout = useSuperAdminLogout();

  return (
    <Page display="flex" flexDir="column">
      <AppBar justify="space-between">
        <Button colorScheme="danger" size="xs" onClick={handleLogout}>Logout</Button>
      </AppBar>
      <Content justifyContent="center" alignItems="stretch" flexGrow={1}>
        <Sidebar w={64}>
          <Paper h="100%" pt={4} variant="hoverableRect" _hover={{
            boxShadow: 'rgba(0, 0, 0, 0.1) 10px 0px 15px -3px',
          }}>
            <SidebarNavigation
              items={[
                { key: 'dashboard', label: 'Dashboard', href: '/_admin/dashboard', icon: <HomeIcon/> },
                { key: 'accounts', label: 'Accounts', href: '/_admin/accounts', icon: <AccountsIcon/> },
                { key: 'deals', label: 'Deals', href: '/_admin/deals', icon: <DealsIcon/> },
              ]}
            />
          </Paper>
        </Sidebar>
        <FlexCol flexGrow={1}>
          {children}
        </FlexCol>
      </Content>
      <AppFooter/>
    </Page>
  );
}

export const getAdminLayout: GetLayoutFunction = (page) => <SuperAdminLayout>{page}</SuperAdminLayout>;
