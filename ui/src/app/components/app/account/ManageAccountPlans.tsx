import React, { useCallback } from 'react';
import { AccountService } from '../../../services/account/user/AccountService';
import { FreePlanView } from './plan/FreePlanView';
import { TrialPlanView } from './plan/TrialPlanView';
import { PaidPlanView } from './plan/PaidPlanView';
import { useAuthService } from '../../../services/account/user/AuthService';
import { sleep } from '../../../services/utils/utils';


export function ManageAccountPlans() {
  const accountService: AccountService = AccountService.useService();
  const accountDetailsQuery = accountService.useAccountBillingDetails();
  const { refetch } = accountDetailsQuery;
  const account = accountDetailsQuery.data;
  const authService = useAuthService();

  const onCancel = useCallback(async () => {
    await refetch();
    await sleep(2000);
    await authService.refreshAccountUserSession();
  }, [refetch, authService]);

  const onUpgrade = useCallback(async () => {
    await refetch();
    await sleep(2000);
    await authService.refreshAccountUserSession();
  }, [refetch, authService]);

  if (!account) {
    return (
      <div>Loading...</div>
    );
  }

  if (account.status === 'Free') {
    return (
      <FreePlanView account={account}/>
    );
  }

  if (account.status === 'Trial') {
    return (
      <TrialPlanView account={account} onUpgrade={onUpgrade} onCancel={onCancel}/>
    );
  }

  return <PaidPlanView account={account} onCancel={onCancel}/>;
}
