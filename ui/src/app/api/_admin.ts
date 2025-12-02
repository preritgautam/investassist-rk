import { adminSession } from '../../userSession';
import { DealDoc } from './accountUser';

const f = adminSession.apiFactory;

export const createAdminTokenApi = f.createPostApi('/api/_admin/auth/token');
export const validateAdminSessionApi = f.createGetApi('/api/_admin/auth/token');
export const logoutAdminApi = f.createPostApi('/api/_admin/auth/logout');
export const changeAdminPasswordApi = f.createPostApi('/api/_admin/auth/update-password');
export const forgotAdminPasswordApi = f.createPostApi('/api/_admin/auth/forgot-password');
export const resetAdminPasswordApi = f.createPostApi('/api/_admin/auth/reset-password');

export const getAccountsApi = f.createGetApi('/api/_admin/accounts');
export const updateAccountApi = f.createPatchApi((accountId) => `/api/_admin/accounts/${accountId}`);
export const deleteAccountApi = f.createDeleteApi((accountId) => `/api/_admin/accounts/${accountId}`);
export const createAccountApi = f.createPostApi('/api/_admin/accounts');
export const updateAccountTemplateApi = f.createPostApi(
  (accountId: string) => `/api/_admin/accounts/${accountId}/templates`,
);
export const getAccountTemplateApi = f.createGetApi(
  (accountId: string) => `/api/_admin/accounts/${accountId}/templates`,
);
export const deleteAccountTemplateApi = f.createDeleteApi(
  (accountId: string) => `/api/_admin/accounts/${accountId}/templates`,
);
export const getAccountTemplateFileApi = f.createGetApi(
  (accountId: string) => `/api/_admin/accounts/${accountId}/templates/file`,
  { responseType: 'blob' },
);

export const getAccountUsersApi = f.createGetApi((accountId) => `/api/_admin/accounts/${accountId}/users`);
export const deleteAccountUserApi = f.createDeleteApi(
  ({ accountId, userId }) => `/api/_admin/accounts/${accountId}/users/${userId}`);

export const getAccountDealsApi = f.createGetApi(
  (accountId) => `/api/_admin/deals/${accountId}/deals`,
);

export const getDealDocumentsApi = f.createGetApi(
  (dealId) => `/api/_admin/deals/${dealId}/documents`,
);

export const getDocumentFileApi = f.createGetApi(
  ({ documentId }: DealDoc) => `/api/_admin/deals/documents/${documentId}`,
  { responseType: 'blob' },
);

export const getDealsReportFileApi = f.createGetApi(
  ({ documentId }: DealDoc) => `/api/_admin/deals/download/report`,
  { responseType: 'blob' },
);
