import { PageComponent } from '../../../src/bootstrap/types';
import { useQueryParam } from '../../../src/bootstrap/hooks/utils/useQueryParam';
import { useClikGatewayService } from '../../../src/app/services/auth/ClikGatewayService';
import React, { useCallback, useEffect, useState } from 'react';
import { useRoutingService } from '../../../src/app/services/RoutingService';
import { FlexCol } from '../../../src/bootstrap/chakra/components/layouts/FlexCol';
import { Heading, Text, VStack } from '@chakra-ui/react';
import { LinkButton } from '../../../src/bootstrap/chakra/components/core/LinkButton';

const AuthClikGatewaySuccessPage: PageComponent = () => {
  const clikGateway = useClikGatewayService();
  const ssoToken = useQueryParam('token');
  const customRedirect = useQueryParam('customRedirect');
  const routingService = useRoutingService();
  const [accountDisabled, setAccountDisabled] = useState(false);

  const getTokenAndRedirect = useCallback(async () => {
    try {
      await clikGateway.validateToken(ssoToken);
      if (!customRedirect) {
        await routingService.gotoUserHomePage();
      } else {
        await routingService.gotoUrl(customRedirect);
      }
    } catch (e) {
      if (e?.response?.data?.type === 'accountDisabledError') {
        setAccountDisabled(true);
      }
    }
  }, [clikGateway, ssoToken, routingService, customRedirect]);

  useEffect(() => {
    getTokenAndRedirect().catch(console.error);
  }, [getTokenAndRedirect]);

  if (!accountDisabled) {
    return null;
  }

  return (
    <FlexCol align="center" mt={40}>
      <VStack mb={12}>
        <Heading>Account Disabled</Heading>
        <Text>It seems your company account is disabled. Please contact your admin team to resolve this.</Text>
      </VStack>
      <LinkButton href="/" variant="solid">Goto Home Page</LinkButton>
    </FlexCol>
  );
};

export default AuthClikGatewaySuccessPage;
