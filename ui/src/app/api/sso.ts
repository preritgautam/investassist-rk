import { userSession, adminSession } from '../../userSession';

const f = userSession.apiFactory;
const fAdmin = adminSession.apiFactory;


export const getClikGatewayAuthUrlApi = f.createPostApi('/api/auth/clik-gateway/auth-url');
export const getTokenByClikGatewaySSOTokenApi = f.createPostApi('/api/auth/clik-gateway/token');
export const getClikGatewayAdminAuthUrlApi = fAdmin.createGetApi('/api/_admin/auth/clik-gateway/auth-url');
export const getClikGatewayAddAccountUrlApi = fAdmin.createGetApi('/api/_admin/auth/clik-gateway/add-account-url');
export const getAdminTokenByClikGatewaySSOTokenApi = fAdmin.createPostApi('/api/_admin/auth/clik-gateway/token');

