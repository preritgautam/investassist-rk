import React, { useEffect } from 'react';
import { PageComponent } from '../../src/bootstrap/types';
import { FlexCol } from '../../src/bootstrap/chakra/components/layouts/FlexCol';
import { useQueryParam } from '../../src/bootstrap/hooks/utils/useQueryParam';
import { useClikGatewayAuthUrl } from '../../src/app/hooks/auth/useClikGatewayAuthUrl';
import { useRoutingService } from '../../src/app/services/RoutingService';
import { BodyS } from '../../src/bootstrap/chakra/components/typography';

const AccountLoginPage: PageComponent = () => {
  const accountSlug = useQueryParam('accountSlug');
  const { authUrl } = useClikGatewayAuthUrl(accountSlug);
  const routingService = useRoutingService();

  useEffect(() => {
    if (authUrl) {
      setTimeout(() => {
        routingService.goto({ url: authUrl }).catch(console.error);
      }, 3000);
    }
  }, [authUrl, routingService]);

  return (
    <FlexCol>
      <BodyS>Redirecting to ClikGateway for authentication..</BodyS>
    </FlexCol>
  );
};

export default AccountLoginPage;
