import React, { ReactElement, useCallback, useRef } from 'react';
import { useAccountService } from '../../../../services/account/user/AccountService';
import { useRouter } from 'next/router';
import { FlexCol } from '../../../../../bootstrap/chakra/components/layouts/FlexCol';
import { Box, Button, Checkbox, Heading, Icon, Table, Tbody, Td, Text, Tfoot, Th, Thead, Tr } from '@chakra-ui/react';
import { CrossIcon, TickIcon } from '../../icons';
import { Account } from '../../../../../types';

interface PlanTitleProps {
  children: string;
  color: 'gray' | 'green' | 'blue';
}

function PlanTitle({ children, color }: PlanTitleProps) {
  return (
    <Th
      textAlign="center" color="primary.500"
      borderTopWidth={3} borderTopColor={`${color}.500`}
      borderLeftWidth={1} borderLeftColor="blue.50"
      borderBottomColor="blue.50"
      w={72}
    >{children}</Th>
  );
}

interface HasFeatureProps {
  children: string;
}

function HasFeature({ children }: HasFeatureProps) {
  return (
    <Td
      textAlign="center"
      borderLeftWidth={1} borderLeftColor="blue.50"
      borderBottomColor="blue.50"
    >
      {children === 'Yes' ? (
        <Icon as={TickIcon} color="blue.500" fontSize="lg"/>
      ) : (
        <Icon as={CrossIcon} color="red.500" fontSize="lg"/>
      )}
    </Td>
  );
}

interface FeatureCellProps {
  children: string;
}

function FeatureCell({ children }: FeatureCellProps) {
  return (
    <Td
      borderBottomColor="blue.50"
    >{children}</Td>
  );
}

interface ActionCellProps {
  children: ReactElement;
}

function ActionCell({ children }: ActionCellProps) {
  return (
    <Td
      borderLeftColor="blue.50" borderLeftWidth={1}
      verticalAlign="bottom"
    >{children}</Td>
  );
}

interface PlanSelectorProps {
  planId: 'plan1' | 'plan2';
  oneTrialAvailed: boolean;
}

function PlanSelector({ planId, oneTrialAvailed }: PlanSelectorProps) {
  const accountService = useAccountService();
  const getCheckoutUrlMutation = accountService.useGetSubscriptionCheckoutUrlMutation();
  const includeTrialRef = useRef<HTMLInputElement>();
  const router = useRouter();

  const startCheckoutSession = useCallback(async () => {
    const includeTrial = includeTrialRef.current.checked;
    const checkoutUrl = await getCheckoutUrlMutation.mutateAsync({ planId, includeTrial });
    await router.push(checkoutUrl);
  }, [getCheckoutUrlMutation, planId, router]);

  return (
    <FlexCol gap={3}>
      <Checkbox
        size="sm" ref={includeTrialRef} defaultChecked={!oneTrialAvailed}
        isDisabled={oneTrialAvailed}
      >
        <Text fontSize="xs">Include 14 days trial of our Lite version</Text>
      </Checkbox>
      {oneTrialAvailed && (
        <Text fontSize="xs" color="warning.500">You have already availed the trial once.</Text>
      )}
      <Button onClick={startCheckoutSession} isLoading={getCheckoutUrlMutation.isLoading}>Select Plan</Button>
    </FlexCol>
  );
}

interface FreePlanViewProps {
  account: Account;
}

export function FreePlanView({ account }: FreePlanViewProps) {
  return (
    <FlexCol alignItems="center" w="full" maxH="100%">
      <Heading size="lg" my={8}>Manage Billing</Heading>
      <Box boxShadow="_sm" m={2} borderWidth={1} borderColor="blue.50" borderRadius="md">
        <Table>
          <Thead>
            <Tr h={12}>
              <Th w={32} borderBottomColor="blue.50"></Th>
              <PlanTitle color="gray">Free Plan</PlanTitle>
              <PlanTitle color="green">For Syndicators</PlanTitle>
              <PlanTitle color="blue">For Enterprise</PlanTitle>
            </Tr>
          </Thead>
          <Tbody>
            <Tr>
              <FeatureCell>Returns Summary (Leveraged & Unleveraged)</FeatureCell>
              <HasFeature>No</HasFeature>
              <HasFeature>Yes</HasFeature>
              <HasFeature>Yes</HasFeature>
            </Tr>
            <Tr>
              <FeatureCell>Valuation Summary</FeatureCell>
              <HasFeature>No</HasFeature>
              <HasFeature>Yes</HasFeature>
              <HasFeature>Yes</HasFeature>
            </Tr>
            <Tr>
              <FeatureCell>Unit Mix</FeatureCell>
              <HasFeature>No</HasFeature>
              <HasFeature>Yes</HasFeature>
              <HasFeature>Yes</HasFeature>
            </Tr>
            <Tr>
              <FeatureCell>Debt Summary</FeatureCell>
              <HasFeature>No</HasFeature>
              <HasFeature>Yes</HasFeature>
              <HasFeature>Yes</HasFeature>
            </Tr>
            <Tr>
              <FeatureCell>Investor Returns</FeatureCell>
              <HasFeature>No</HasFeature>
              <HasFeature>Yes</HasFeature>
              <HasFeature>Yes</HasFeature>
            </Tr>
            <Tr>
              <FeatureCell>LP, GP Distributions</FeatureCell>
              <HasFeature>No</HasFeature>
              <HasFeature>Yes</HasFeature>
              <HasFeature>Yes</HasFeature>
            </Tr>
            <Tr>
              <FeatureCell>Partnership Returns</FeatureCell>
              <HasFeature>No</HasFeature>
              <HasFeature>Yes</HasFeature>
              <HasFeature>Yes</HasFeature>
            </Tr>
            <Tr>
              <FeatureCell>Cashflow and Proforma</FeatureCell>
              <HasFeature>No</HasFeature>
              <HasFeature>Yes</HasFeature>
              <HasFeature>Yes</HasFeature>
            </Tr>
            <Tr>
              <FeatureCell>Sensitivity/Scenarios</FeatureCell>
              <HasFeature>No</HasFeature>
              <HasFeature>No</HasFeature>
              <HasFeature>Yes</HasFeature>
            </Tr>
            <Tr>
              <FeatureCell>Abatement</FeatureCell>
              <HasFeature>No</HasFeature>
              <HasFeature>No</HasFeature>
              <HasFeature>Yes</HasFeature>
            </Tr>
            <Tr>
              <FeatureCell>Sync multiple Assumption Sets</FeatureCell>
              <HasFeature>No</HasFeature>
              <HasFeature>No</HasFeature>
              <HasFeature>Yes</HasFeature>
            </Tr>
            <Tr>
              <FeatureCell>Assumable Loans</FeatureCell>
              <HasFeature>No</HasFeature>
              <HasFeature>No</HasFeature>
              <HasFeature>Yes</HasFeature>
            </Tr>
            <Tr>
              <FeatureCell>Custom Renovation Schedule</FeatureCell>
              <HasFeature>No</HasFeature>
              <HasFeature>No</HasFeature>
              <HasFeature>Yes</HasFeature>
            </Tr>
            <Tr>
              <FeatureCell>
                Add detailed Other Income, Expenses and Capex Items
              </FeatureCell>
              <HasFeature>No</HasFeature>
              <HasFeature>No</HasFeature>
              <HasFeature>Yes</HasFeature>
            </Tr>
            <Tr>
              <FeatureCell>Variable inflation rates</FeatureCell>
              <HasFeature>No</HasFeature>
              <HasFeature>No</HasFeature>
              <HasFeature>Yes</HasFeature>
            </Tr>
          </Tbody>
          <Tfoot>
            <Tr>
              <Td></Td>
              <ActionCell>
                <FlexCol justifyContent="flex-end" h="full">
                  <Button isDisabled={true}>Current Plan</Button>
                </FlexCol>
              </ActionCell>
              <ActionCell>
                <PlanSelector planId="plan1" oneTrialAvailed={account.oneTrialAvailed}/>
              </ActionCell>
              <ActionCell>
                <PlanSelector planId="plan2" oneTrialAvailed={account.oneTrialAvailed}/>
              </ActionCell>
            </Tr>
          </Tfoot>
        </Table>
      </Box>
    </FlexCol>
  );
}
