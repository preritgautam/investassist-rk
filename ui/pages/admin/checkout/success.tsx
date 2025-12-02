import React, { useEffect } from 'react';
import { PageComponent } from '../../../src/bootstrap/types';
import { getAccountUserLayout } from '../../../src/app/components/app/layouts/AccountUserLayout2';
import { FlexCol } from '../../../src/bootstrap/chakra/components/layouts/FlexCol';
import { useAccountService } from '../../../src/app/services/account/user/AccountService';
import { LinkButton } from '../../../src/bootstrap/chakra/components/core/LinkButton';
import { Box, Heading, Text } from '@chakra-ui/react';
import CheckoutSuccessImage from '../../../src/app/images/checkout-success.webp';
import Image from 'next/image';
import { DateTime } from 'luxon';
import { RoutingService } from '../../../src/app/services/RoutingService';
import { PlanMap } from '../../../src/app/constant/PlanMap';
import { useAuthService } from '../../../src/app/services/account/user/AuthService';

const SubscriptionSuccessPage: PageComponent = () => {
  const authService = useAuthService();
  const subscriptionSuccessStatusQuery = useAccountService().useSubscriptionSuccessStatusQuery();

  useEffect(() => {
    // refresh session to include any account status change
    authService.refreshAccountUserSession().catch(console.error);
  }, [authService]);

  if (subscriptionSuccessStatusQuery.isLoading) {
    return (
      <FlexCol>Verifying your status..</FlexCol>
    );
  }

  const trialEndsOn = DateTime
    .fromISO(subscriptionSuccessStatusQuery.data.trialStartedOn)
    .plus({ days: 14 })
    .toFormat('MMMM dd, yyyy');

  return (
    <FlexCol alignItems="center" w="full">
      <Heading size="lg" color="primary.500" mt={8}>Congratulations!</Heading>
      <Box w={96}>
        <Image src={CheckoutSuccessImage}/>
      </Box>
      {subscriptionSuccessStatusQuery.data.isPaid && (
        <FlexCol gap={2} alignItems="center">
          <Text>You have successfully subscribed to </Text>
          <Text fontWeight="bold">InvestAssist {PlanMap[subscriptionSuccessStatusQuery.data.plan]}</Text>
        </FlexCol>
      )}
      {subscriptionSuccessStatusQuery.data.isTrial && (
        <FlexCol gap={2} alignItems="center">
          <Text>You have successfully subscribed to <strong>InvestAssist Trial Plan</strong></Text>
          <Text>Your trial will continue till <strong>{trialEndsOn}</strong></Text>
          <Text>After that your credit card will be charged and you will be upgraded to</Text>
          <Text fontWeight="bold">InvestAssist {PlanMap[subscriptionSuccessStatusQuery.data.plan]}</Text>
        </FlexCol>
      )}
      <LinkButton href={RoutingService.userDealsPage} mt={4} variant="solid">Go To Home Page</LinkButton>
    </FlexCol>
  );
};

SubscriptionSuccessPage.getLayout = getAccountUserLayout;
export default SubscriptionSuccessPage;
