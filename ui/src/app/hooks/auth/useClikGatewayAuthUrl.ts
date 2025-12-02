import { useEffect, useState } from 'react';
import { useClikGatewayService } from '../../services/auth/ClikGatewayService';


export function useClikGatewayAuthUrl(accountSlug: string, customRedirect?: string) {
  const clikGateway = useClikGatewayService();
  const [authUrl, setAuthUrl] = useState<string>(null);

  useEffect(() => {
    clikGateway.getAuthUrl(accountSlug, customRedirect).then(setAuthUrl);
  }, [accountSlug, clikGateway, customRedirect]);

  return { authUrl };
}
