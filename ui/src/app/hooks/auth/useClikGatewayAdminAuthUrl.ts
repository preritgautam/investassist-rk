import { useEffect, useState } from 'react';
import { useClikGatewayService } from '../../services/auth/ClikGatewayService';


export function useClikGatewayAdminAuthUrl() {
  const clikGateway = useClikGatewayService();
  const [authUrl, setAuthUrl] = useState<string>(null);

  useEffect(() => {
    clikGateway.getAdminAuthUrl().then(setAuthUrl);
  }, [clikGateway]);

  return { authUrl };
}
