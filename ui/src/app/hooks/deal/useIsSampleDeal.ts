import { userSession } from '../../../userSession';
import { Deal } from '../../../types';

export function useIsSampleDeal(deal: Deal) {
  const { user } = userSession.useAuthManager();
  return user?.accountId !== deal?.accountId && deal?.isSampleDeal;
}
