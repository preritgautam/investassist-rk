import React from 'react';
import { adminSession } from '../../../userSession';
import { RoutingService } from '../../services/RoutingService';

export interface UseAutoLoginProps {
  onSessionExists: (object) => any;
}

function useAutoLogin({ onSessionExists }: UseAutoLoginProps) {
  const { user } = adminSession.useAuthManager();

  if (!!user) {
    onSessionExists(user);
  }
}


export function useAutoSuperAdminLogin() {
  const routingService: RoutingService = RoutingService.useService();

  const handleLoggedIn = React.useCallback(async () => {
    // don't do anything unless on browser
    if (typeof window !== 'undefined') {
      await routingService.gotoAdminDashboard({ replace: true });
    }
  }, [routingService]);

  useAutoLogin({ onSessionExists: handleLoggedIn });
}
