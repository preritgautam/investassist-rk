import React from 'react';
import { SuperAdminAuthService, useSuperAdminAuthService } from '../../services/_admin/SuperAdminAuthService';
import { RoutingService, useRoutingService } from '../../services/RoutingService';
import { adminSession, userSession } from '../../../userSession';
import { AuthService, useAuthService } from '../../services/account/user/AuthService';

function useValidateSession(onInvalidSession, checkSession, currentAuthManagerUser, timeoutSeconds = 60) {
  const userId = currentAuthManagerUser?.id;
  const validateSession = React.useCallback(async () => {
    try {
      const user = await checkSession();
      if (userId) {
        if (user.id !== userId) {
          await onInvalidSession();
        }
      }
    } catch (e) {
      await onInvalidSession();
      return {};
    }
  }, [checkSession, onInvalidSession, userId]);

  React.useEffect(() => {
    const timer = setInterval(async () => {
      await validateSession();
    }, timeoutSeconds * 1000);

    return () => {
      clearInterval(timer);
    };
  }, [timeoutSeconds, validateSession]);

  React.useEffect(() => {
    if (!currentAuthManagerUser) {
      onInvalidSession().catch(console.error);
    }
  }, [currentAuthManagerUser, onInvalidSession]);

  React.useEffect(() => {
    validateSession().catch(console.error);
  }, [validateSession]);

  return { user: currentAuthManagerUser };
}


export function useValidateSuperAdminSession(timeoutSeconds = 60) {
  const { user: currentAuthManagerUser } = adminSession.useAuthManager();
  const authService: SuperAdminAuthService = useSuperAdminAuthService();
  const routingService: RoutingService = useRoutingService();

  const handleInvalidSession = React.useCallback(async () => {
    await authService.logout();
    await routingService.gotoAdminLoginPage({ replace: true });
  }, [routingService, authService]);

  return useValidateSession(
    handleInvalidSession, authService.validateAdminSession, currentAuthManagerUser, timeoutSeconds,
  );
}

export function useValidateAccountUserSession(timeoutSeconds = 60) {
  const { user: currentAuthManagerUser, timestamp } = userSession.useAuthManager();
  const authService: AuthService = useAuthService();
  const routingService: RoutingService = useRoutingService();

  const handleInvalidSession = React.useCallback(async () => {
    await authService.logout();
    await routingService.gotoHomePage({ replace: true });
  }, [routingService, authService]);

  return {
    ...useValidateSession(
      handleInvalidSession, authService.validateAccountUserSession, currentAuthManagerUser, timeoutSeconds,
    ),
    timestamp,
  };
}


