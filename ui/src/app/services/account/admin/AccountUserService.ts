/* eslint-disable react-hooks/rules-of-hooks */
import { Service } from '../../../../bootstrap/service/Service';
import { deleteUserApi, getAccountUsersApi } from '../../../api/accountUser';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import {
  AccountUser,
} from '../../../../types';
import Error from 'next/error';

export class AdminAccountUserService extends Service {
  useQueries() {
    const useAccountUsers = () => useQuery<AccountUser[], Error>(
      ['admin-account-users'],
      () => this.getAccountUsers(),
    );
    return {
      useAccountUsers: useAccountUsers,
    };
  };


  useDeleteUser() {
    const client = useQueryClient();
    return useMutation<void, Error, string>(this.deleteAccountUser, {
      onSuccess: () => client.invalidateQueries(['admin-account-users']),
    });
  }

  async getAccountUsers() {
    const { data: { accountUsers } } = await getAccountUsersApi();
    return accountUsers;
  }

  async deleteAccountUser(userId: string) {
    await deleteUserApi({ urlParams: userId });
  }
}

export const useAdminAccountUserService: () => AdminAccountUserService = () => AdminAccountUserService.useService();
