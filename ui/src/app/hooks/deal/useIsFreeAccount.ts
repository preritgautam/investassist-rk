import { userSession } from '../../../userSession';

export function useIsFreeAccount() {
  const { user } = userSession.useAuthManager();
  return user?.accountStatus === 'Free';
}
