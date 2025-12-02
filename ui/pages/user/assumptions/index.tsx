import React from 'react';
import { PageContent } from '../../../src/bootstrap/chakra/components/layouts/PageContent';
import { getAccountUserLayout } from '../../../src/app/components/app/layouts/AccountUserLayout2';
import { LinkButton } from '../../../src/bootstrap/chakra/components/core/LinkButton';
import { RoutingService } from '../../../src/app/services/RoutingService';
import { useAssumptionService } from '../../../src/app/services/account/user/AssumptionService';
import { Heading, HStack } from '@chakra-ui/react';
import { FlexCol } from '../../../src/bootstrap/chakra/components/layouts/FlexCol';
import { AssumptionTable } from '../../../src/app/components/app/assumptions/AssumptionTable';
import { userSession } from '../../../src/userSession';
import { useIsFreeAccount } from '../../../src/app/hooks/deal/useIsFreeAccount';


const AssumptionsPage = () => {
  const assumptionService = useAssumptionService();
  const userAssumptions = assumptionService.useUserAssumptions().data ?? [];
  const accountAssumptions = assumptionService.useAccountAssumptions().data ?? [];
  const { user } = userSession.useAuthManager();
  const isFreeAccount = useIsFreeAccount();

  return (
    <PageContent
      pageTitle="Assumptions"
      mainActionButton={(
        <div>
          <LinkButton href={RoutingService.userNewAssumptionPage} variant="solid"
            mr={2} isDisabled={isFreeAccount}>
            Add New Assumption
          </LinkButton>
          {user?.isRootUser && (
            <LinkButton href={RoutingService.companyNewAssumptionPage} variant="solid"
              isDisabled={isFreeAccount}>
              Add Company Assumption
            </LinkButton>
          )}
        </div>
      )}
    >
      <HStack w="100%" spacing={12} align="flex-start" minH={0} overflow="auto" alignItems="stretch">
        <FlexCol flexGrow={1} w="100%">
          <Heading mb={4}>Your Assumptions Set</Heading>
          <AssumptionTable assumptions={userAssumptions} editable={true}/>
        </FlexCol>
        <FlexCol flexGrow={1} w="100%">
          <Heading mb={4}>Company Assumptions Set</Heading>
          <AssumptionTable assumptions={accountAssumptions} editable={user?.isRootUser}/>
        </FlexCol>
      </HStack>
    </PageContent>
  );
};

AssumptionsPage.getLayout = getAccountUserLayout;
export default AssumptionsPage;
