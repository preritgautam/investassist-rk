import { PageComponent } from '../../../src/bootstrap/types';
import { getAdminLayout } from '../../../src/app/components/app/layouts/SuperAdminLayout';
import React from 'react';
import { useRouter } from 'next/router';
import { PageContent } from '../../../src/bootstrap/chakra/components/layouts/PageContent';
import { AccountUsersList } from '../../../src/app/components/app/user/UsersList';
import { useSAAccountUserService } from '../../../src/app/services/_admin/AccountUserService';
import { noopArray } from '../../../src/bootstrap/utils/noop';

const AdminAccountsPage: PageComponent = () => {
  const router = useRouter();
  const accountName = router.query['accountName'];
  const accountId = router.query['accountId'] as string;
  const usersQuery = useSAAccountUserService().useAccountUsers(accountId);
  const users = usersQuery.data ?? noopArray;

  return (
    <>
      <PageContent
        pageTitle={`Account Users - ${accountName} `}
      >
        <AccountUsersList
          accountUsers={users} accountId={accountId}
          isLoading={usersQuery.isLoading} onRefresh={usersQuery.refetch}
        />
      </PageContent>
    </>
  );
};

AdminAccountsPage.getLayout = getAdminLayout;

export default AdminAccountsPage;
