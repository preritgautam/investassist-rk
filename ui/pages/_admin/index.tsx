import React from 'react';
import { PageComponent } from '../../src/bootstrap/types';
import { getDefaultLayout } from '../../src/app/components/app/layouts/DefaultLayout';
import { useAutoSuperAdminLogin } from '../../src/app/hooks/auth/useAutoLogin';
import { LinkButton } from '../../src/bootstrap/chakra/components/core/LinkButton';
import { FlexCol } from '../../src/bootstrap/chakra/components/layouts/FlexCol';
import { ClikGatewayAdminLoginButton } from '../../src/app/components/app/auth/ClikGatewayAdminLoginButton';

const AdminHomePage: PageComponent = () => {
  useAutoSuperAdminLogin();

  return (
    <FlexCol w={96} mt={40} align="center">
      <ClikGatewayAdminLoginButton variant="solid">
        Login Via Clik Account
      </ClikGatewayAdminLoginButton>
      <LinkButton href="/">Goto Home Page</LinkButton>
    </FlexCol>
  );
};

AdminHomePage.getLayout = getDefaultLayout;

export default AdminHomePage;
