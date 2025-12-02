import React from 'react';
import { getAccountUserLayout } from '../../src/app/components/app/layouts/AccountUserLayout2';
import { userSession } from '../../src/userSession';
import { noopArray } from '../../src/bootstrap/utils/noop';
import { useAdminAccountUserService } from '../../src/app/services/account/admin/AccountUserService';
import { PageContent } from '../../src/bootstrap/chakra/components/layouts/PageContent';
import { Heading } from '@chakra-ui/react';
import { AccountUsersList } from '../../src/app/components/app/user/UsersList';
import { LinkButton } from '../../src/bootstrap/chakra/components/core/LinkButton';
import { appConfig } from '../../src/config';


const AccountUsersListPage = function() {
  const { user } = userSession.useAuthManager();
  const isRootUser = user.isRootUser;
  const usersQuery = useAdminAccountUserService().useQueries().useAccountUsers();
  const users = usersQuery.data ?? noopArray;
  const manageUsersUrl = `${appConfig.clikGateway.baseUrl}/${appConfig.clikGateway.manageUsersUrl}`;

  if (!isRootUser) {
    return (
      <div>
                Oops! It seems you are at wrong place. You don&apos;t have access to this area of the application.
      </div>
    );
  }

  return (
    <>
      <PageContent
        pageTitle="Account Users"
        mainActionButton={(
          <LinkButton href={manageUsersUrl} variant="solid" target="_blank">Manage Users on Clik Gateway</LinkButton>
        )}
      >
        <Heading marginBottom={2} ml={2}>User Limit - {user.accountDetails.userLimit}</Heading>
        <AccountUsersList
          accountUsers={users} isLoading={usersQuery.isLoading} onRefresh={usersQuery.refetch}
        />
      </PageContent>
    </>

  );
};

AccountUsersListPage.getLayout = getAccountUserLayout;
export default AccountUsersListPage;
