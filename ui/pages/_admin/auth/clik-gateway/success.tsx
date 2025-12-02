import { useCallback, useEffect } from 'react';
import { PageComponent } from '../../../../src/bootstrap/types';
import { useClikGatewayService } from '../../../../src/app/services/auth/ClikGatewayService';
import { useQueryParam } from '../../../../src/bootstrap/hooks/utils/useQueryParam';
import { useRoutingService } from '../../../../src/app/services/RoutingService';

const AdminAuthClikGatewaySuccessPage: PageComponent = () => {
  const clikGateway = useClikGatewayService();
  const ssoToken = useQueryParam('token');
  const routingService = useRoutingService();

  const getTokenAndRedirect = useCallback(async () => {
    await clikGateway.validateAdminToken(ssoToken).catch(console.error);
    await routingService.gotoAdminDashboard();
  }, [clikGateway, ssoToken, routingService]);

  useEffect(() => {
    getTokenAndRedirect().catch(console.error);
  }, [getTokenAndRedirect]);

  return null;
};

export default AdminAuthClikGatewaySuccessPage;
