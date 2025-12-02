import React, { useCallback } from 'react';
import { PageComponent } from '../../../src/bootstrap/types';
import { getHomeLayout } from '../../../src/app/components/app/layouts/HomeLayout';
import { userSession } from '../../../src/userSession';
import { useRoutingService } from '../../../src/app/services/RoutingService';
import { useEffect } from 'react';
import { useTrainnService } from '../../../src/app/services/account/user/TrainnService';
import { useClikGatewayAuthUrl } from '../../../src/app/hooks/auth/useClikGatewayAuthUrl';

const TrainnLoginPage: PageComponent = () => {
  const { token, user } = userSession.useAuthManager();
  const routing = useRoutingService();
  const trainnService = useTrainnService();
  const { authUrl: loginUrl } = useClikGatewayAuthUrl('', '/auth/trainn/login');

  const redirectToTrainn = useCallback(async () => {
    const sessionUrl = await trainnService.createSession();
    await routing.goto({ url: sessionUrl });
  }, [routing, trainnService]);

  useEffect(() => {
    if (token && user) {
      redirectToTrainn().catch(console.error);
    } else if (loginUrl) {
      routing.gotoUrl(loginUrl).catch(console.error);
    }
  }, [token, user, redirectToTrainn, loginUrl, routing]);

  return (
    <div>Loading...</div>
  );
};

TrainnLoginPage.getLayout = getHomeLayout;
export default TrainnLoginPage;
