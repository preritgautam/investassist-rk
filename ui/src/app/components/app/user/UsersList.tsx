import React from 'react';
import { Flex } from '@chakra-ui/react';
import { AccountUser } from '../../../../types';
import { DeleteAccountUserButton } from './DeleteUser';
import { DataTable } from '../../../../bootstrap/chakra/components/tables/DataTable';
import { DefaultColumnFilter } from '../../../../bootstrap/chakra/components/tables/filters/DefaultColumnFilter';
import { SelectColumnFilter } from '../../../../bootstrap/chakra/components/tables/filters/SelectColumnFilter';
import { DateCellRenderer } from '../../../../bootstrap/chakra/components/tables/DateCellRenderer';
import { BodyS } from '../../../../bootstrap/chakra/components/typography';

interface AccountUserActionsProps {
    accountUser: AccountUser,
    accountId?: string,
}

function AccountUserActions({ accountUser, accountId = null }: AccountUserActionsProps) {
  return (
    <Flex align="center">
      <DeleteAccountUserButton accountUser={accountUser} accountId={accountId} onSuccess={() => null}/>
    </Flex>
  );
}

export interface AccountUsersListProps {
    accountUsers: AccountUser[],
    isLoading: boolean,
    onRefresh: () => void,
    accountId?: string,
}


export function AccountUsersList({ accountUsers, accountId, isLoading, onRefresh }: AccountUsersListProps) {
  // @ts-ignore
  return (
    <DataTable
      data={accountUsers}
      title="Account Users"
      onRefresh={onRefresh}
      loading={isLoading}
      columns={[
        { accessor: 'name', Header: 'Name', Filter: DefaultColumnFilter as any },
        { accessor: 'email', Header: 'Email', Filter: DefaultColumnFilter as any },
        {
          accessor: 'roles',
          Header: 'Roles',
          Filter: DefaultColumnFilter as any,
          Cell: ({ value }: { value: string[] }) => <BodyS>{value.join(', ')}</BodyS>,
        },
        {
          accessor: 'enabled',
          Header: 'Enabled',
          Filter: SelectColumnFilter as any,
          Cell: ({ value }: { value: boolean }) => <BodyS>{value ? 'Yes' : 'No'}</BodyS>,
        },
        {
          accessor: 'createdAt', Header: 'Created On', disableFilters: true,
          Cell: DateCellRenderer,
        },
        {
          Header: 'Actions',
          // eslint-disable-next-line react/prop-types
          Cell: ({ row: { original: accountUser } }) =>
            <AccountUserActions accountId={accountId} accountUser={accountUser as AccountUser}/>,
        },
      ]}
    />
  );
}
