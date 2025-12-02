import React, { useMemo } from 'react';
import { createContext, ReactNode, useContext } from 'react';
import { COA } from '../../types';
import { useAccountService } from '../services/account/user/AccountService';
import { noopArray } from '../../bootstrap/utils/noop';

export interface COAValues {
  coaList: COA[];
  coaObj: Record<string, string[]>;
}

const AccountCoaContext = createContext<COAValues>({ coaList: [], coaObj: {} });

export function useAccountCOA() {
  return useContext(AccountCoaContext);
}

export function AccountCoaContextProvider({ accountId, children }: { accountId: string, children: ReactNode }) {
  const accountService = useAccountService();
  const coaQuery = accountService.useAccountTemplateCOAQuery(accountId);

  const coaList: COA[] = coaQuery.data ?? noopArray;
  const coaObj = useMemo(() => coaList.reduce(
    (obj: Record<string, string[]>, { head, category }: COA) => {
      obj[head] = obj[head] ?? [];
      obj[head].push(category);
      return obj;
    },
    {},
  ), [coaList]);


  return (
    <AccountCoaContext.Provider value={{ coaList, coaObj }}>
      {children}
    </AccountCoaContext.Provider>
  );
}
