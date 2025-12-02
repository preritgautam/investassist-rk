/* eslint-disable react-hooks/rules-of-hooks */
import { Service } from '../../../bootstrap/service/Service';
import { deleteAccountUserApi, getAccountUsersApi } from '../../api/_admin';
import { Account, AccountUser, PickOptional } from '../../../types';
import { useMutation, useQuery, useQueryClient, UseQueryOptions } from 'react-query';
import Error from 'next/error';

// eslint-disable-next-line max-len
export type UpdateAccountParams =
  Pick<Account, 'id'>
  & PickOptional<Account, 'status' | 'enabled' | 'planId' | 'userLimit'>;

export class AccountUserService extends Service {
  useAccountUsers(accountId, options?: UseQueryOptions<AccountUser[], Error>) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useQuery<AccountUser[], Error>(
      ['super-admin-account-users', accountId],
      async () => {
        const { data: { accountUsers } } = await getAccountUsersApi({ urlParams: accountId });
        return accountUsers;
      },
      options,
    );
  }

  useDeleteUser() {
    const client = useQueryClient();
    return useMutation<string, Error, any>(this.deleteAccountUser, {
      onSuccess: (accountId) => client.invalidateQueries(['super-admin-account-users', accountId]),
    });
  }

  async deleteAccountUser({ accountId, userId }) {
    await deleteAccountUserApi({ urlParams: { accountId, userId } });
    return accountId;
  }
}

export const useSAAccountUserService: () => AccountUserService = () => AccountUserService.useService();
