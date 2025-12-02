import { userSession } from '../../userSession';

const f = userSession.apiFactory;

export type DealDoc = {
  dealId: string;
  documentId: string;
}

function dealDocApi(dealId: string, documentId: string, path) {
  return `/api/account/user/deals/${dealId}/documents/${documentId}${path}`;
}

export const getGooglePlacesSuggestionApi = f.createPostApi('/api/googlePlaces');
export const getDetailsByPlaceId = f.createGetApi((placeId: string) => `/api/googlePlaces/${placeId}`);

export const validateAccountUserSessionApi = f.createGetApi('/api/account/user/auth/token');
export const refreshAccountUserSessionApi = f.createPostApi('/api/account/user/auth/refresh-token');
export const logoutAccountUserApi = f.createPostApi('/api/account/user/auth/logout');
export const getAccountUserPasswordChangeUrlApi = f.createGetApi('/api/account/user/auth/change-password-url');


export const getAccountUsersApi = f.createGetApi('/api/account/user/accounts/users');
export const getAccountDetailsApi = f.createGetApi('/api/account/user/accounts/account');

export const addDealApi = f.createPostApi('/api/account/user/deals');
export const getDealsApi = f.createGetApi('/api/account/user/deals');

export const getDealApi = f.createGetApi((dealId: string) => `/api/account/user/deals/${dealId}`);
export const getDealBySlugApi = f.createGetApi((slug) => `/api/account/user/deals/slug/${slug}`);
export const updateDealApi = f.createPatchApi((dealId: string) => `/api/account/user/deals/${dealId}`);
export const assignDealApi = f.createPatchApi(
  ({ dealId }: { dealId: string }) =>
    `/api/account/user/deals/${dealId}/assign`,
);
export const deleteDealApi = f.createDeleteApi(
  (dealId: string) => `/api/account/user/deals/${dealId}`,
);

export const getDealDetailsApi = f.createGetApi((dealId: string) => `/api/account/user/deals/${dealId}/details`);
export const updateDealDetailsApi = f.createPatchApi((dealId: string) => `/api/account/user/deals/${dealId}/details`);


export const getMatchingCFDealsApi = f.createGetApi(
  (dealId: string) => `/api/account/user/deals/${dealId}/matchingDeals/cashFlow`,
);
export const getDealDictionaryApi = f.createGetApi(
  (dealId: string) => `/api/account/user/deals/${dealId}/dictionary`,
);

export const downloadDealModelApi = f.createPostApi(
  (dealId: string) => `/api/account/user/deals/${dealId}/model/download`,
  { responseType: 'blob' },
);

export const getDealModelHistoryApi = f.createGetApi(
  (dealId: string) => `/api/account/user/deals/${dealId}/model/history`,
);

export const downloadDealModelHistoryApi = f.createPostApi(
  ({ dealId, modelHistoryId }) => `/api/account/user/deals/${dealId}/model/history/${modelHistoryId}/download`,
  { responseType: 'blob' },
);

export const deleteDealModelHistoryApi = f.createDeleteApi(
  ({ dealId, modelHistoryId }) => `/api/account/user/deals/${dealId}/model/history/${modelHistoryId}`,
);

export const uploadDealDocumentApi = f.createPostApi((dealId: string) => `/api/account/user/deals/${dealId}/documents`);
export const getDealDocumentsApi = f.createGetApi((dealId: string) => `/api/account/user/deals/${dealId}/documents`);
export const getDealDocumentApi = f.createGetApi(
  ({ dealId, documentId }: DealDoc) => `/api/account/user/deals/${dealId}/documents/${documentId}`,
);
export const deleteDealDocumentApi = f.createDeleteApi(
  ({ dealId, documentId }: DealDoc) => `/api/account/user/deals/${dealId}/documents/${documentId}`,
);
export const reprocessDocumentApi = f.createPostApi(
  ({ dealId, documentId }: DealDoc) => dealDocApi(dealId, documentId, '/reprocess'),
);
export const getDocumentFileUrlApi = f.createGetApi(
  ({ dealId, documentId }: DealDoc) => dealDocApi(dealId, documentId, '/fileUrl'),
);
export const getDocumentFileApi = f.createGetApi(
  ({ dealId, documentId }: DealDoc) => dealDocApi(dealId, documentId, '/file'),
  { responseType: 'blob' },
);
export const getDocumentDataApi = f.createGetApi(
  ({ dealId, documentId }: DealDoc) => dealDocApi(dealId, documentId, '/documentData'),
);
export const updateDocumentDataApi = f.createPatchApi(
  ({ dealId, documentId }: DealDoc) => dealDocApi(dealId, documentId, '/documentData'),
);

export const updateCompressedDocumentDataApi = f.createPatchApi(
  ({ dealId, documentId }: DealDoc) => dealDocApi(dealId, documentId, '/documentData/compressed'),
);

export const renameDealDocumentApi = f.createPatchApi(
  ({ dealId, documentId }: DealDoc) => dealDocApi(dealId, documentId, '/rename'),
);

export const setAsOnDateApi = f.createPatchApi(
  ({ dealId, documentId }: DealDoc) => dealDocApi(dealId, documentId, '/asOnDate'),
);

export const validateDealDocumentApi = f.createPatchApi(
  ({ dealId, documentId }: DealDoc) => dealDocApi(dealId, documentId, '/validate'),
);

export const raiseDocumentTicketApi = f.createPostApi(
  ({ dealId, documentId }: DealDoc) => dealDocApi(dealId, documentId, '/raiseTicket'),
);

export const getDocumentChargeCodeConfigApi = f.createGetApi(
  ({ dealId, documentId }: DealDoc) => dealDocApi(dealId, documentId, '/documentData/chargeCodeConfig'),
);

export const updateDocumentChargeCodeConfigApi = f.createPatchApi(
  ({ dealId, documentId }: DealDoc) => dealDocApi(dealId, documentId, '/documentData/chargeCodeConfig'),
);

export const getDocumentOccupancyConfigApi = f.createGetApi(
  ({ dealId, documentId }: DealDoc) => dealDocApi(dealId, documentId, '/documentData/occupancyConfig'),
);

export const updateDocumentOccupancyConfigApi = f.createPatchApi(
  ({ dealId, documentId }: DealDoc) => dealDocApi(dealId, documentId, '/documentData/occupancyConfig'),
);

export const getDocumentFPConfigApi = f.createGetApi(
  ({ dealId, documentId }: DealDoc) => dealDocApi(dealId, documentId, '/documentData/fpConfig'),
);

export const updateDocumentFPConfigApi = f.createPatchApi(
  ({ dealId, documentId }: DealDoc) => dealDocApi(dealId, documentId, '/documentData/fpConfig'),
);

export const getDocumentLastUsedRenovatedConfigConfigApi = f.createGetApi(
  ({ dealId, documentId }: DealDoc) => dealDocApi(dealId, documentId, '/documentData/lastUsedRenovatedConfig'),
);

export const updateDocumentLastUsedRenovatedConfigConfigApi = f.createPatchApi(
  ({ dealId, documentId }: DealDoc) => dealDocApi(dealId, documentId, '/documentData/lastUsedRenovatedConfig'),
);

export const getDocumentLastUsedAffordableConfigApi = f.createGetApi(
  ({ dealId, documentId }: DealDoc) => dealDocApi(dealId, documentId, '/documentData/lastUsedAffordableConfig'),
);

export const updateDocumentLastUsedAffordableConfigApi = f.createPatchApi(
  ({ dealId, documentId }: DealDoc) => dealDocApi(dealId, documentId, '/documentData/lastUsedAffordableConfig'),
);

export const getDocumentLastUsedMtmConfigApi = f.createGetApi(
  ({ dealId, documentId }: DealDoc) => dealDocApi(dealId, documentId, '/documentData/lastUsedMtmConfig'),
);

export const updateDocumentLastUsedMtmConfigApi = f.createPatchApi(
  ({ dealId, documentId }: DealDoc) => dealDocApi(dealId, documentId, '/documentData/lastUsedMtmConfig'),
);

export const getDealAssumptionApi = f.createGetApi(
  (dealId: string) => `/api/account/user/deals/${dealId}/assumption`,
);
export const updateDealAssumptionApi = f.createPatchApi(
  (dealId: string) => `/api/account/user/deals/${dealId}/assumption`,
);


export const addAssumptionApi = f.createPostApi('/api/account/user/assumptions');
export const getUserAssumptionsApi = f.createGetApi('/api/account/user/assumptions');
export const deleteUserAssumptionApi = f.createDeleteApi(
  (assumptionId: string) => `/api/account/user/assumptions/${assumptionId}`,
);
export const getUserAssumptionApi = f.createGetApi(
  (assumptionId: string) => `/api/account/user/assumptions/${assumptionId}`,
);
export const getAccountAssumptionApi = f.createGetApi(
  (assumptionId: string) => `/api/account/user/assumptions/account/${assumptionId}`,
);
export const updateUserAssumptionApi = f.createPutApi(
  (assumptionId: string) => `/api/account/user/assumptions/${assumptionId}`,
);
export const getAccountAssumptionsApi = f.createGetApi('/api/account/user/assumptions/account-assumptions');

export const addCompanyAssumptionApi = f.createPostApi('/api/account/admin/assumptions');

export const deleteUserApi = f.createDeleteApi(
  (userId: string) => `/api/account/root/accounts/users/${userId}`,
);
export const updateUserPreferencesApi = f.createPatchApi('/api/account/user/accountUser/userPreferences');
export const acceptTermsApi = f.createPostApi('/api/account/user/accountUser/terms');


export const createTrainnSessionApi = f.createPostApi('/api/account/user/trainn/session');

export const getAccountCoaApi = f.createGetApi('/api/account/user/accounts/account/coa');
export const getAccountCoaSummaryApi = f.createGetApi('/api/account/user/accounts/account/coa/summary');
