import { SuperAdminAuthService } from '../../services/_admin/SuperAdminAuthService';
import React from 'react';
import { RoutingService } from '../../services/RoutingService';
import { noopFunc } from '../../../bootstrap/utils/noop';
import { AuthService } from '../../services/account/user/AuthService';

export type OnLogout = () => any;

export function useSuperAdminLogout(onLogout: OnLogout = noopFunc) {
  const routingService: RoutingService = RoutingService.useService();
  const authService: SuperAdminAuthService = SuperAdminAuthService.useService();

  const handleLogout = React.useCallback(async () => {
    await authService.logout();
    await routingService.gotoAdminLoginPage();
    await onLogout();
  }, [onLogout, routingService, authService]);

  return handleLogout;
}

export function useAccountUserLogout(onLogout: OnLogout = noopFunc) {
  const routingService: RoutingService = RoutingService.useService();
  const authService: AuthService = AuthService.useService();

  const handleLogout = React.useCallback(async () => {
    await authService.logout();
    await routingService.gotoHomePage({ replace: true });
    await onLogout();
  }, [onLogout, routingService, authService]);

  return handleLogout;
}
