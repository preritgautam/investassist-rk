import { userSession } from '../../../userSession';
import { useRoutingService } from '../../services/RoutingService';


export function useTermsAccepted(ignoreTerms) {
  const routingService = useRoutingService();
  const { user } = userSession.useAuthManager();
  if (user && !ignoreTerms) {
    const { acceptedTermsOn } = user;
    if (!acceptedTermsOn) {
      routingService.gotoAccountUserAcceptTermsPage().catch(console.error);
    }
  }
}
