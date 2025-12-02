import React from 'react';
import { PageComponent } from '../../src/bootstrap/types';
import { PageContent } from '../../src/bootstrap/chakra/components/layouts/PageContent';
import { LinkButton } from '../../src/bootstrap/chakra/components/core/LinkButton';
import { RoutingService } from '../../src/app/services/RoutingService';
import { getAccountUserLayout } from '../../src/app/components/app/layouts/AccountUserLayout2';

const UserHomePage: PageComponent = () => {
  return (
    <PageContent pageTitle="User Home Page">
      <LinkButton href={RoutingService.userDealsPage}>View Deals</LinkButton>
    </PageContent>
  );
};

UserHomePage.getLayout = getAccountUserLayout;
export default UserHomePage;
