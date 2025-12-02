/* eslint-disable react-hooks/rules-of-hooks */
import { Service } from '../../../../bootstrap/service/Service';
import {
  getAccountCoaApi,
  getAccountCoaSummaryApi,
  getAccountUsersApi,
  updateUserPreferencesApi,
} from '../../../api/accountUser';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import {
  Account,
  AccountUser, COA,
  SubscriptionSuccessStatus, SummaryItem,
  UserPreferences,
} from '../../../../types';
import { userSession } from '../../../../userSession';
import {
  getAccountBillingDetailsApi,
  getSubscriptionSuccessStatusApi, getSubscriptionCheckoutUrlApi,
  cancelSubscriptionApi, upgradeSubscriptionApi, getStripePortalUrlApi,
} from '../../../api/rootUser';


export interface UpdateUserPreferencesParams {
  userPreferences: UserPreferences;
}

export interface GetSubscriptionCheckoutUrlParams {
  planId: string;
  includeTrial: boolean;
}

export class AccountService extends Service {
  useQueries() {
    const useAccountUsers = () => useQuery<AccountUser[], Error>(
      ['account-users'],
      () => this.getAccountUsers(),
    );
    return {
      useAccountUsers: useAccountUsers,
    };
  };

  useAccountBillingDetails() {
    return useQuery<Account, Error>(
      ['user-account'],
      async () => {
        const { data: { account } } = await getAccountBillingDetailsApi();
        return account;
      },
    );
  }

  useSubscriptionSuccessStatusQuery() {
    return useQuery<SubscriptionSuccessStatus, Error>(
      ['subscription-status'],
      async () => {
        const { data } = await getSubscriptionSuccessStatusApi();
        return data;
      },
    );
  }

  useStripePortalUrlQuery() {
    return useQuery<string, Error>(
      ['stripe-portal-url'],
      async () => {
        const { data: { portalUrl } } = await getStripePortalUrlApi();
        return portalUrl;
      }, {
        refetchInterval: false,
        refetchIntervalInBackground: false,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
      },
    );
  }

  useCancelAccountSubscriptionMutation() {
    const client = useQueryClient();
    return useMutation<void, Error>(async () => {
      await cancelSubscriptionApi();
    }, {
      onSuccess: () => {
        client.invalidateQueries('user-account');
      },
    });
  }

  useGetSubscriptionCheckoutUrlMutation() {
    return useMutation<string, Error, GetSubscriptionCheckoutUrlParams>(
      async (data: GetSubscriptionCheckoutUrlParams) => {
        const { data: { checkoutUrl } } = await getSubscriptionCheckoutUrlApi({ data });
        return checkoutUrl;
      },
    );
  }

  useUpgradeAccountFromTrialToPaidMutation() {
    const queryClient = useQueryClient();
    return useMutation<void, Error>(async () => {
      await upgradeSubscriptionApi();
    }, {
      onSuccess: async () => {
        await queryClient.invalidateQueries('user-account');
      },
    });
  }

  useUpdateUserPreferences() {
    return useMutation<void, Error, UpdateUserPreferencesParams>(this.updateUserPreferences);
  }

  async getAccountUsers() {
    const { data: { accountUsers } } = await getAccountUsersApi();
    return accountUsers;
  }

  async updateUserPreferences({ userPreferences }: UpdateUserPreferencesParams) {
    await updateUserPreferencesApi({ data: { userPreferences } });
    const sessionObj = userSession.authManager.getSessionObj();
    userSession.authManager.startSession({
      ...sessionObj,
      user: { ...sessionObj.user, userPreferences },
    });
  }

  useAccountTemplateCOAQuery(accountId: string) {
    return useQuery<COA[], Error>(
      ['account-coa', accountId],
      async (): Promise<COA[]> => {
        const { data: { coa } } = await getAccountCoaApi();
        return [
          {
            'head': 'Omitted Items',
            'category': 'Omitted Income',
          },
          {
            'head': 'Omitted Items',
            'category': 'Omitted Expense',
          },
          {
            'head': 'Omitted Items',
            'category': 'Omitted Capital Expense',
          },
          ...coa,
        ];
      }, {
        // We want this to be readily available till the browser is open or page not refreshed
        staleTime: Infinity,
      },
    );
  }

  useAccountTemplateCOASummaryQuery(accountId: string) {
    return useQuery<SummaryItem[], Error>(
      ['account-coa-summary', accountId],
      async (): Promise<SummaryItem[]> => {
        const { data: { coaSummary } } = await getAccountCoaSummaryApi();
        return coaSummary;
      }, {
        // We want this to be readily available till the browser is open or page not refreshed
        staleTime: Infinity,
      },
    );
  }
}

export const useAccountService: () => AccountService = () => AccountService.useService();
