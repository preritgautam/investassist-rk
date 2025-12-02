import React, { useCallback } from 'react';
import { PageComponent } from '../../../src/bootstrap/types';
import { PageContent } from '../../../src/bootstrap/chakra/components/layouts/PageContent';
import { Button, Text } from '@chakra-ui/react';
import { getAdminLayout } from '../../../src/app/components/app/layouts/SuperAdminLayout';
import { useQueryParam } from '../../../src/bootstrap/hooks/utils/useQueryParam';
import { unscramble2 } from '../../../src/bootstrap/utils/base64';
import { useAccountsService } from '../../../src/app/services/_admin/AccountsService';
import { FlexCol } from '../../../src/bootstrap/chakra/components/layouts/FlexCol';
import { useRoutingService } from '../../../src/app/services/RoutingService';

const AddAccountSuccessPage: PageComponent = function() {
  const routing = useRoutingService();
  const encryptedAccountId = useQueryParam('accountId');
  const encryptedUserId = useQueryParam('userId');
  const cgAccountId = unscramble2(encryptedAccountId);
  const cgUserId = unscramble2(encryptedUserId);
  const accountsService = useAccountsService();
  const createAccountMutation = accountsService.useCreateAccount();

  const createAccount = useCallback(async () => {
    if (cgAccountId && cgUserId) {
      await createAccountMutation.mutateAsync({ cgAccountId, cgUserId });
      await routing.gotoAdminAccountsPage();
    }
  }, [cgAccountId, cgUserId, createAccountMutation, routing]);

  return (
    <PageContent pageTitle="Account Added">
      <FlexCol>
        <Text>Account is added on Clik Gateway</Text>
        <Text>AccountId: {cgAccountId}</Text>
        <Text>UserId: {cgUserId}</Text>
        <Button onClick={createAccount} alignSelf="flex-start">
          Add Account to Invest Assist
        </Button>
      </FlexCol>
    </PageContent>
  );
};

AddAccountSuccessPage.getLayout = getAdminLayout;

export default AddAccountSuccessPage;
