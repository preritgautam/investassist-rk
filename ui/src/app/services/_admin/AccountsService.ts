import { Service } from '../../../bootstrap/service/Service';
import {
  createAccountApi, deleteAccountApi, deleteAccountTemplateApi,
  getAccountsApi,
  getAccountTemplateApi,
  updateAccountApi,
  updateAccountTemplateApi,
} from '../../api/_admin';
import { Account, AccountTemplate, PickOptional } from '../../../types';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { omit } from '@chakra-ui/utils';
import { AccountTemplateFormValues } from '../../../../pages/_admin/accountTemplates';
import FormData from 'form-data';

export interface CreateAccountParams {
  cgAccountId: string;
  cgUserId: string;
}

// eslint-disable-next-line max-len
export type UpdateAccountParams =
  Pick<Account, 'id'>
  & PickOptional<Account, 'status' | 'enabled' | 'planId' | 'userLimit'>;

export class AccountsService extends Service {
  useAccounts() {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useQuery<Account[], Error>(
      ['all-accounts'],
      async () => {
        const { data: { accounts } } = await getAccountsApi();
        return accounts;
      },
    );
  }

  useUpdateAccount() {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useMutation<Account, Error, UpdateAccountParams>(async (_account: UpdateAccountParams) => {
      const { data: { account } } = await updateAccountApi({
        urlParams: _account.id,
        data: { account: omit(_account, ['id']) },
      });
      return account;
    });
  }

  useCreateAccount() {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useMutation<void, Error, CreateAccountParams>(this.createAccount);
  }

  async createAccount({ cgAccountId, cgUserId }): Promise<void> {
    await createAccountApi({
      data: { cgAccountId, cgUserId },
    });
  }

  async addAccountTemplate(accountId: string, values: AccountTemplateFormValues) {
    const formData = new FormData();
    formData.append('name', values.name);
    formData.append('chartOfAccount', values.chartOfAccount);
    formData.append('modelFile', values.modelFile[0]);

    await updateAccountTemplateApi({ urlParams: accountId, data: formData });
  }

  useAccountTemplateQuery(accountId: string) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useQuery<AccountTemplate, Error>(
      ['template', accountId],
      async () => {
        const { data: { template } } = await getAccountTemplateApi({ urlParams: accountId });
        return template;
      }, {
        enabled: !!accountId,
      },
    );
  }

  useDeleteAccountMutation() {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const client = useQueryClient();

    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useMutation<void, Error, string>(async (accountId: string) => {
      await deleteAccountApi({ urlParams: accountId });
    }, {
      async onSuccess() {
        await client.invalidateQueries(['all-accounts']);
      },
    });
  }

  useDeleteAccountTemplate() {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const client = useQueryClient();
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useMutation<void, Error, string>(async (accountId: string) => {
      await deleteAccountTemplateApi({ urlParams: accountId });
    }, {
      async onSuccess(_, accountId) {
        await client.invalidateQueries(['template', accountId]);
      },
    });
  }
}

export const useAccountsService: () => AccountsService = () => AccountsService.useService();
