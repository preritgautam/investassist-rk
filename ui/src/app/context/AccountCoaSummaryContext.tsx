import React from 'react';
import { createContext, ReactNode, useContext } from 'react';
import { SummaryItem } from '../../types';
import { useAccountService } from '../services/account/user/AccountService';
import { noopArray } from '../../bootstrap/utils/noop';

const AccountCoaSummaryContext = createContext<SummaryItem[]>([]);

export function useAccountCOASummary() {
  return useContext(AccountCoaSummaryContext);
}

export function AccountCoaSummaryContextProvider({ accountId, children }: { accountId: string, children: ReactNode }) {
  const accountService = useAccountService();
  const coaSummaryQuery = accountService.useAccountTemplateCOASummaryQuery(accountId);
  const summary: SummaryItem[] = coaSummaryQuery.data ?? noopArray;

  return (
    <AccountCoaSummaryContext.Provider value={summary}>
      {children}
    </AccountCoaSummaryContext.Provider>
  );
}
