import { Account } from '../../../../../types';
import { DateTime } from 'luxon';
import { FlexCol } from '../../../../../bootstrap/chakra/components/layouts/FlexCol';
import { Box, Heading, HStack, Text } from '@chakra-ui/react';
import Image from 'next/image';
import TrialPlanImage from '../../../../images/trial-plan.webp';
import { PlanMap } from '../../../../constant/PlanMap';
import { CancelSubscriptionButton } from './CancelSubscriptionButton';
import React from 'react';
import { StripePortalLinkButton } from './StripePortalLinkButton';

interface PaidPlanViewProps {
  account: Account;
  onCancel: () => void;
}

export function PaidPlanView({ account, onCancel }: PaidPlanViewProps) {
  const planEndsOn = DateTime
    .fromISO(account.currentSubscriptionEndsOn)
    .toFormat('MMMM dd, yyyy');

  return (
    <FlexCol alignItems="center" w="full">
      <Heading size="lg" mt={8}>Manage Billing</Heading>
      <Box w={80}>
        <Image src={TrialPlanImage}/>
      </Box>
      <FlexCol gap={2} alignItems="center">
        <Text>You are currently on <strong>InvestAssist {PlanMap[account.planId]}</strong></Text>

        <FlexCol gap={2} alignItems="center">
          {account.markedForCancellationOn && (
            <>
              <Text>Your subscription is marked for cancellation.</Text>
              <Text>You can still use current plan till {planEndsOn}</Text>
            </>
          )}
          {!account.markedForCancellationOn && (
            <>
              <Text>Your current subscription is valid till {planEndsOn}</Text>
              <Text>You will be automatically charged and your subscription will be extended by one year after current
                subscription ends</Text>

              <HStack spacing={4} mt={8}>
                <StripePortalLinkButton/>
                <CancelSubscriptionButton
                  variant="outline" colorScheme="danger" onDone={onCancel}
                  message={
                    `If you cancel subscription, your current plan will remain active till
               ${planEndsOn}. You won't be charged again to renew your subscription`
                  }
                >
                  Cancel Subscription
                </CancelSubscriptionButton>
              </HStack>
            </>
          )}
        </FlexCol>
      </FlexCol>
    </FlexCol>
  );
}
