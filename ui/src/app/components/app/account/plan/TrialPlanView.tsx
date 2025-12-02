import { Account } from '../../../../../types';
import { DateTime } from 'luxon';
import { FlexCol } from '../../../../../bootstrap/chakra/components/layouts/FlexCol';
import { Box, Flex, Heading, Text } from '@chakra-ui/react';
import Image from 'next/image';
import TrialPlanImage from '../../../../images/trial-plan.webp';
import { PlanMap } from '../../../../constant/PlanMap';
import { UpgradeAccountButton } from './UpgradeAccountButton';
import { CancelSubscriptionButton } from './CancelSubscriptionButton';
import React from 'react';
import { StripePortalLinkButton } from './StripePortalLinkButton';

interface TrialPlanViewProps {
  account: Account;
  onUpgrade: () => void;
  onCancel: () => void;
}

export function TrialPlanView({ account, onUpgrade, onCancel }: TrialPlanViewProps) {
  const trialEndsOn = DateTime
    .fromISO(account.trialStartedOn)
    .plus({ days: 14 })
    .toFormat('MMMM dd, yyyy');

  return (
    <FlexCol alignItems="center" w="full">
      <Heading size="lg" mt={8}>Manage Billing</Heading>
      <Box w={80}>
        <Image src={TrialPlanImage}/>
      </Box>
      <FlexCol gap={2} alignItems="center">
        <Text>You are currently on <strong>InvestAssist Trial Plan</strong></Text>
        <Text>Once you are billed at the end of the trial period, you will be upgraded
          to <strong>InvestAssist {PlanMap[account.planId]}</strong></Text>
        <Text>This will happen on {trialEndsOn}</Text>

        <Flex gap={4} mt={8}>
          <StripePortalLinkButton/>
          <UpgradeAccountButton account={account} onDone={onUpgrade}>Upgrade Plan Now</UpgradeAccountButton>
          <CancelSubscriptionButton
            variant="outline" colorScheme="danger" onDone={onCancel}
            message={
              `Are you sure you want to cancel your subscription? 
               This will also end your trial plan and you will only have access to the Free Plan.`
            }
          >
            Cancel Subscription
          </CancelSubscriptionButton>
        </Flex>
      </FlexCol>
    </FlexCol>
  );
}
