import React from 'react';
import { PageComponent } from '../../src/bootstrap/types';
import { FlexCol } from '../../src/bootstrap/chakra/components/layouts/FlexCol';
import { BodyM, BodyS, HeadingM } from '../../src/bootstrap/chakra/components/typography';
import { Button } from '@chakra-ui/react';
import { getAdminLayout } from '../../src/app/components/app/layouts/SuperAdminLayout';
import { useSuperAdminLogout } from '../../src/app/hooks/auth/useLogout';

const AdminDashboardPage: PageComponent = () => {
  const handleLogout = useSuperAdminLogout();

  return (
    <FlexCol align="center" pt={40}>
      <HeadingM>Hello, Admin!</HeadingM>
      <BodyM mt={4}>Nothing to do here YET</BodyM>
      <BodyS>You can log out though!</BodyS>
      <Button colorScheme="danger" mt={8} onClick={handleLogout}>Logout</Button>
    </FlexCol>
  );
};

AdminDashboardPage.getLayout = getAdminLayout;

export default AdminDashboardPage;
