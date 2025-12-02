/* eslint-disable react-hooks/rules-of-hooks */
import { saveAs } from 'file-saver';
import { strToU8, compressSync } from 'fflate';
import { Service } from '../../../../bootstrap/service/Service';
import {
  DealDocument,
  DocumentData,
  DealDocumentType,
  ChargeCodeConfig,
  OccupancyConfig,
  FPConfig, RenovationConfiguration,
  AffordableConfiguration, MtmConfiguration,
} from '../../../../types';
import {
  deleteDealDocumentApi,
  getDealDocumentsApi,
  getDocumentDataApi,
  getDocumentFileApi,
  getDocumentFileUrlApi,
  reprocessDocumentApi,
  updateDocumentDataApi,
  updateCompressedDocumentDataApi,
  uploadDealDocumentApi,
  renameDealDocumentApi,
  updateDocumentChargeCodeConfigApi,
  getDocumentChargeCodeConfigApi,
  getDocumentOccupancyConfigApi,
  updateDocumentOccupancyConfigApi,
  getDocumentFPConfigApi,
  updateDocumentFPConfigApi,
  getDocumentLastUsedRenovatedConfigConfigApi,
  updateDocumentLastUsedRenovatedConfigConfigApi,
  getDealDocumentApi,
  getDocumentLastUsedAffordableConfigApi,
  updateDocumentLastUsedAffordableConfigApi,
  validateDealDocumentApi,
  raiseDocumentTicketApi, setAsOnDateApi, getDocumentLastUsedMtmConfigApi, updateDocumentLastUsedMtmConfigApi,
} from '../../../api/accountUser';
import { QueryClient, useMutation, useQueries, useQuery, useQueryClient, UseQueryOptions } from 'react-query';
import { noopArray } from '../../../../bootstrap/utils/noop';
import { TicketDetails } from '../../../components/app/deal/document/ticket/RaiseTicketFormModal';

async function fileToDataUrl(file: File): Promise<ArrayBuffer> {
  const reader = new FileReader();
  return new Promise((resolve, reject) => {
    reader.addEventListener('load', () => resolve(reader.result as ArrayBuffer));
    reader.addEventListener('error', () => reject(reader.error));
    reader.readAsDataURL(file);
  });
}

export interface UploadDocumentParams {
  dealId: string,
  file: File,
  fileName: string,
  startPage: number,
  endPage: number,
  documentType: DealDocumentType,
  onProgress?: (percent: number, remainingTimeMs: number) => void,
}

export interface DeleteDealDocumentParams {
  dealId: string,
  documentId: string
}

export interface ReprocessDocumentParams {
  dealId: string,
  documentId: string,
  startPage: number,
  endPage: number,
}

export interface UpdateDocumentDataParams {
  dealId: string;
  documentId: string;
  editedData: object;
}

export interface UpdateDocumentChargeCodeConfigParams {
  dealId: string;
  documentId: string;
  chargeCodeConfig: ChargeCodeConfig;
}

export interface UpdateDocumentOccupancyConfigParams {
  dealId: string;
  documentId: string;
  occupancyConfig: OccupancyConfig;
}

export interface UpdateDocumentFPConfigParams {
  dealId: string;
  documentId: string;
  fpConfig: FPConfig;
}

export interface UpdateDocumentLastUsedRenovatedConfigConfigParams {
  dealId: string;
  documentId: string;
  lastUsedRenovatedConfig: RenovationConfiguration;
}

export interface UpdateDocumentLastUsedAffordableConfigParams {
  dealId: string;
  documentId: string;
  lastUsedAffordableConfig: AffordableConfiguration;
}

export interface UpdateDocumentLastUsedMtmConfigParams {
  dealId: string;
  documentId: string;
  lastUsedMtmConfig: MtmConfiguration;
}

export interface ValidateDocumentParams {
  dealId: string;
  documentId: string;
  validate: boolean;
}

export interface RenameDealDocumentParams {
  dealId: string;
  documentId: string;
  name: string;
}

export interface SetAsOnDateParams {
  dealId: string;
  documentId: string;
  asOnDate: string;
}

export interface RaiseTicketParams {
  dealId: string;
  documentId: string;
  ticketParams: TicketDetails;
}

export class DealDocumentsService extends Service {
  useDocumentData(dealId, documentId) {
    return useQuery<DocumentData, Error>(
      ['account-user-document-data', documentId],
      () => this.getDocumentData(dealId, documentId),
      {
        enabled: !!(dealId && documentId),
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        refetchOnMount: false,
      },
    );
  }

  useMultipleDocumentData(docs: [string, string][]) {
    return useQueries(
      docs.map(([dealId, documentId]) => ({
        queryKey: ['account-user-document-data', documentId],
        queryFn: () => this.getDocumentData(dealId, documentId),
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        refetchOnMount: false,
      })),
    );
  }

  useMultipleDocumentsData(docs: Record<string, string>) {
    return useQueries(
      Reflect.ownKeys(docs).map((dealId: string) => ({
        queryKey: ['account-user-document-data', docs[dealId]],
        queryFn: () => this.getDocumentData(dealId, docs[dealId]),
      })),
    );
  }

  useUpdateDocumentDataMutation() {
    const client = useQueryClient();
    return useMutation<void, Error, UpdateDocumentDataParams>(this.updateDocumentData, {
      onSuccess: (_, params: UpdateDocumentDataParams) => client.invalidateQueries(
        ['account-user-document-data', params.documentId],
      ),
    });
  }

  useUpdateChargeCodeConfigMutation() {
    const client = useQueryClient();
    return useMutation<void, Error, UpdateDocumentChargeCodeConfigParams>(
      this.updateDocumentChargeCodeConfig, {
        onSuccess: (_, params: UpdateDocumentChargeCodeConfigParams) => client.invalidateQueries(
          ['account-user-document-charge-code-config', params.documentId],
        ),
      },
    );
  }

  useChargeCodeConfig(dealId, documentId) {
    return useQuery<ChargeCodeConfig, Error>(
      ['account-user-document-charge-code-config', documentId],
      () => this.getDocumentChargeCodeConfig(dealId, documentId),
      {
        enabled: !!(dealId && documentId),
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        refetchOnMount: false,
      },
    );
  }
  useMultipleChargeCodeConfig(dealAndDocs: [string, string][]) {
    return useQueries(
      dealAndDocs.map(([dealId, documentId]) => ({
        queryKey: ['account-user-document-charge-code-config', documentId],
        queryFn: () => this.getDocumentChargeCodeConfig(dealId, documentId),
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        refetchOnMount: false,
      })),
    );
  }


  useUpdateOccupancyConfigMutation() {
    const client = useQueryClient();
    return useMutation<void, Error, UpdateDocumentOccupancyConfigParams>(
      this.updateDocumentOccupancyConfig, {
        onSuccess: (_, params: UpdateDocumentOccupancyConfigParams) => client.invalidateQueries(
          ['account-user-document-occupancy-config', params.documentId],
        ),
      },
    );
  }

  useOccupancyConfig(dealId, documentId) {
    return useQuery<OccupancyConfig, Error>(
      ['account-user-document-occupancy-config', documentId],
      () => this.getDocumentOccupancyConfig(dealId, documentId),
      {
        enabled: !!(dealId && documentId),
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        refetchOnMount: false,
      },
    );
  }

  useMultipleOccupancyConfig(dealAndDocs: [string, string][]) {
    return useQueries(
      dealAndDocs.map(([dealId, documentId]) => ({
        queryKey: ['account-user-document-occupancy-config', documentId],
        queryFn: () => this.getDocumentOccupancyConfig(dealId, documentId),
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        refetchOnMount: false,
      })),
    );
  }

  useMultipleDealsDocuments(dealIds: string[]) {
    return useQueries(
      dealIds.map((dealId: string) => ({
        queryKey: ['account-user-deal-documents', dealId],
        queryFn: () => this.getDealDocuments(dealId),
      })),
    );
  }

  useUpdateFPConfigMutation() {
    const client = useQueryClient();
    return useMutation<void, Error, UpdateDocumentFPConfigParams>(
      this.updateDocumentFPConfig, {
        onSuccess: (_, params: UpdateDocumentFPConfigParams) => client.invalidateQueries(
          ['account-user-document-fp-config', params.documentId],
        ),
      },
    );
  }

  useFPConfig(dealId, documentId) {
    return useQuery<FPConfig, Error>(
      ['account-user-document-fp-config', documentId],
      () => this.getDocumentFPConfig(dealId, documentId),
      {
        enabled: !!(dealId && documentId),
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        refetchOnMount: false,
      },
    );
  }

  useMultipleFPConfig(dealAndDocs: [string, string][]) {
    return useQueries(
      dealAndDocs.map(([dealId, documentId]) => ({
        queryKey: ['account-user-document-fp-config', documentId],
        queryFn: () => this.getDocumentFPConfig(dealId, documentId),
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        refetchOnMount: false,
      })),
    );
  }

  useUpdateLastUpdatedRenovatedConfigConfigMutation() {
    const client = useQueryClient();
    return useMutation<void, Error, UpdateDocumentLastUsedRenovatedConfigConfigParams>(
      this.updateDocumentLastUsedRenovatedConfigConfig, {
        onSuccess: (_, params: UpdateDocumentLastUsedRenovatedConfigConfigParams) => client.invalidateQueries(
          ['account-user-document-ren-config', params.documentId],
        ),
      },
    );
  }

  useLastUpdatedRenovatedConfigConfig(dealId, documentId) {
    return useQuery<RenovationConfiguration, Error>(
      ['account-user-document-ren-config', documentId],
      () => this.getDocumentLastUsedRenovatedConfigConfig(dealId, documentId),
      {
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        refetchOnMount: false,
      },
    );
  }

  useUpdateLastUpdatedAffordableConfigConfigMutation() {
    const client = useQueryClient();
    return useMutation<void, Error, UpdateDocumentLastUsedAffordableConfigParams>(
      this.updateDocumentLastUsedAffordableConfig, {
        onSuccess: (_, params: UpdateDocumentLastUsedAffordableConfigParams) => client.invalidateQueries(
          ['account-user-document-aff-config', params.documentId],
        ),
      },
    );
  }

  useUpdateLastUpdatedMtmConfigConfigMutation() {
    const client = useQueryClient();
    return useMutation<void, Error, UpdateDocumentLastUsedMtmConfigParams>(
      this.updateDocumentLastUsedMtmConfig, {
        onSuccess: (_, params: UpdateDocumentLastUsedMtmConfigParams) => client.invalidateQueries(
          ['account-user-document-mtm-config', params.documentId],
        ),
      },
    );
  }

  private updateDocumentInQueries(client: QueryClient, dealId, documentId, document) {
    client.setQueryData(['account-user-deal-document', dealId, documentId], document);
    const documents = client.getQueryData<DealDocument[]>(
      ['account-user-deal-documents', dealId],
    );
    if (documents) {
      const docIndex = documents.findIndex((d) => d.id === documentId);
      if (docIndex > -1) {
        client.setQueryData(
          ['account-user-deal-documents', dealId],
          [
            ...documents.slice(0, docIndex),
            document,
            ...documents.slice(docIndex + 1),
          ],
        );
      }
    }
  }

  useValidateDocumentMutation() {
    const client = useQueryClient();
    return useMutation<Document, Error, ValidateDocumentParams>(
      this.validateDocument, {
        onSuccess: async (document, params: ValidateDocumentParams) => {
          this.updateDocumentInQueries(client, params.dealId, params.documentId, document);
        },
      },
    );
  }

  useRaiseTicketMutation() {
    return useMutation<void, Error, RaiseTicketParams>(this.raiseTicket, {});
  }

  useLastUpdatedAffordableConfig(dealId, documentId) {
    return useQuery<AffordableConfiguration, Error>(
      ['account-user-document-aff-config', documentId],
      () => this.getDocumentLastUsedAffordableConfig(dealId, documentId),
      {
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        refetchOnMount: false,
      },
    );
  }

  useLastUpdatedMtmConfig(dealId, documentId) {
    return useQuery<MtmConfiguration, Error>(
      ['account-user-document-mtm-config', documentId],
      () => this.getDocumentLastUsedMtmConfig(dealId, documentId),
      {
        enabled: !!documentId,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        refetchOnMount: false,
      },
    );
  }

  useDealDocument(dealId: string, documentId: string, options: UseQueryOptions<DealDocument> = {}) {
    const client = useQueryClient();

    return useQuery<DealDocument, Error>(
      ['account-user-deal-document', dealId, documentId],
      () => this.getDealDocument(dealId, documentId),
      {
        ...options,
        initialData: () => {
          return client.getQueryData<DealDocument[]>(
            ['account-user-deal-documents', dealId],
          )?.find((d) => d.id === documentId);
        },
      },
    );
  }

  useMultipleDealDocuments(docs: [string, string][]) {
    const client = useQueryClient();

    return useQueries(
      docs.map(([dealId, documentId]) => ({
        queryKey: ['account-user-deal-document', dealId, documentId],
        queryFn: () => this.getDealDocument(dealId, documentId),
        initialData: () => {
          return client.getQueryData<DealDocument[]>(
            ['account-user-deal-documents', dealId],
          )?.find((d) => d.id === documentId);
        },
      })),
    );
  }

  useSetAsOnDateMutation() {
    const client = useQueryClient();

    return useMutation<void, Error, SetAsOnDateParams>(this.setAsOnDate, {
      onSuccess: async (_: void, params) => {
        await client.invalidateQueries(['account-user-deal-documents', params.dealId]);
        await client.invalidateQueries(['account-user-deal-document', params.dealId, params.documentId]);
      },
    });
  }

  useQueries(dealId) {
    const client = useQueryClient();

    const useDealDocuments = (options: UseQueryOptions<DealDocument[]> = {}) => useQuery<DealDocument[], Error>(
      ['account-user-deal-documents', dealId],
      () => this.getDealDocuments(dealId), {
        refetchInterval: 5000,
        refetchIntervalInBackground: true,
        ...options,
      },
    );

    const addDealDocumentQuery = useMutation<DealDocument, Error, UploadDocumentParams>(this.uploadDocument, {
      onSuccess: () =>
        client.invalidateQueries(['account-user-deal-documents', dealId]),
    });


    const renameDealDocumentMutation = useMutation<void, Error, RenameDealDocumentParams>(this.renameDealDocument, {
      onSuccess: () => client.invalidateQueries(['account-user-deal-documents', dealId]),
    });

    const deleteDealDocumentQuery = useMutation<void, Error, string>(
      (documentId: string) => this.deleteDocument({ dealId, documentId }),
      {
        onSuccess: () => client.invalidateQueries(['account-user-deal-documents', dealId]),
      });

    const reprocessDealDocumentQuery = useMutation<void, Error, Omit<ReprocessDocumentParams, 'dealId'>>(
      (params) => this.reprocessDocument({ dealId, ...params }),
      {
        onSuccess: async (_, params) => {
          await client.invalidateQueries(['account-user-deal-documents', dealId]);
          await client.removeQueries(['account-user-document-data', params.documentId]);
        },
      });

    return {
      useDealDocuments,
      addDealDocumentQuery,
      deleteDealDocumentQuery,
      reprocessDealDocumentQuery,
      renameDealDocumentMutation,
    };
  }

  async getDealDocumentFileUrl(dealId: string, documentId: string): Promise<string> {
    const { data: { url } } = await getDocumentFileUrlApi({ urlParams: { dealId, documentId } });
    return url;
  }

  async getDealDocumentFileUrl2(dealId: string, documentId: string): Promise<string> {
    const response = await getDocumentFileApi({ urlParams: { dealId, documentId } });
    return URL.createObjectURL(new Blob([response.data]));
  }

  async downloadDealDocumentFile(dealId: string, documentId: string, documentName: string): Promise<any> {
    const response = await getDocumentFileApi({ urlParams: { dealId, documentId } });
    return saveAs(response.data, documentName);
  }

  async getDealDocuments(dealId: string) {
    if (!dealId) {
      return noopArray;
    }
    const { data: { documents } } = await getDealDocumentsApi({ urlParams: dealId });
    return documents;
  }

  async getDealDocument(dealId: string, documentId: string) {
    if (!dealId) {
      return null;
    }
    const { data: { document } } = await getDealDocumentApi({ urlParams: { dealId, documentId } });
    return document;
  }

  async getDocumentData(dealId: string, documentId: string): Promise<DocumentData> {
    const { data: { documentData } } = await getDocumentDataApi({ urlParams: { dealId, documentId } });
    return documentData;
  }

  async updateDocumentData({ dealId, documentId, editedData }: UpdateDocumentDataParams): Promise<void> {
    await updateDocumentDataApi({ urlParams: { dealId, documentId }, data: { editedData } });
  }

  async updateCompressedDocumentData({ dealId, documentId, editedData }: UpdateDocumentDataParams): Promise<void> {
    const buffer = strToU8(JSON.stringify(editedData));
    const compressedPayload = compressSync(buffer);
    await updateCompressedDocumentDataApi({ urlParams: { dealId, documentId }, data: { compressedPayload } });
  }

  async renameDealDocument({ dealId, documentId, name }: RenameDealDocumentParams): Promise<void> {
    await renameDealDocumentApi({ urlParams: { dealId, documentId }, data: { name } });
  }

  async setAsOnDate({ dealId, documentId, asOnDate }: SetAsOnDateParams): Promise<void> {
    await setAsOnDateApi({ urlParams: { dealId, documentId }, data: { asOnDate } });
  }

  async uploadDocument(
    {
      file, fileName, dealId, startPage, endPage, documentType, onProgress,
    }: UploadDocumentParams,
  ): Promise<DealDocument> {
    const fileDataUrl = await fileToDataUrl(file);
    const startTimeMs = Date.now();
    const fileExtension = fileName?.split('.').reverse()[0];
    const isXlsxFile = fileExtension.toLowerCase() === 'xlsx';
    const { data: { document } } = await uploadDealDocumentApi({
      urlParams: dealId,
      data: {
        fileDataUrl,
        fileName,
        documentType,
        startPage: isXlsxFile ? 1 : startPage,
        endPage: isXlsxFile ? 1 : endPage,
      },
      options: {
        onUploadProgress: (progressEvent: ProgressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          const nowTimeMs = Date.now();
          const remainingTimeMs = ((nowTimeMs - startTimeMs) * (100 - percentCompleted)) / percentCompleted;
          onProgress?.(percentCompleted, remainingTimeMs);
        },
      },
    });
    return document;
  }

  async deleteDocument({ dealId, documentId }: DeleteDealDocumentParams) {
    await deleteDealDocumentApi({ urlParams: { dealId, documentId } });
  }

  async reprocessDocument({ dealId, documentId, startPage, endPage }: ReprocessDocumentParams) {
    await reprocessDocumentApi({
      urlParams: { dealId, documentId },
      data: {
        startPage, endPage,
      },
    });
  }

  async getDocumentChargeCodeConfig(dealId: string, documentId: string): Promise<ChargeCodeConfig> {
    const { data: { chargeCodeConfig } } = await getDocumentChargeCodeConfigApi({ urlParams: { dealId, documentId } });
    return chargeCodeConfig;
  }

  async updateDocumentChargeCodeConfig({ dealId, documentId, chargeCodeConfig }: UpdateDocumentChargeCodeConfigParams) {
    await updateDocumentChargeCodeConfigApi({ urlParams: { dealId, documentId }, data: { chargeCodeConfig } });
  }

  async getDocumentOccupancyConfig(dealId: string, documentId: string): Promise<OccupancyConfig> {
    const { data: { occupancyConfig } } = await getDocumentOccupancyConfigApi({ urlParams: { dealId, documentId } });
    return occupancyConfig;
  }

  async updateDocumentOccupancyConfig({ dealId, documentId, occupancyConfig }: UpdateDocumentOccupancyConfigParams) {
    await updateDocumentOccupancyConfigApi({ urlParams: { dealId, documentId }, data: { occupancyConfig } });
  }

  async getDocumentFPConfig(dealId: string, documentId: string): Promise<FPConfig> {
    const { data: { fpConfig } } = await getDocumentFPConfigApi({ urlParams: { dealId, documentId } });
    return fpConfig;
  }

  async updateDocumentFPConfig({ dealId, documentId, fpConfig }: UpdateDocumentFPConfigParams) {
    await updateDocumentFPConfigApi({ urlParams: { dealId, documentId }, data: { fpConfig } });
  }

  async getDocumentLastUsedRenovatedConfigConfig(dealId: string, documentId: string): Promise<RenovationConfiguration> {
    const { data: { lastUsedRenovatedConfig } } = await getDocumentLastUsedRenovatedConfigConfigApi(
      { urlParams: { dealId, documentId } },
    );
    return lastUsedRenovatedConfig;
  }

  async updateDocumentLastUsedRenovatedConfigConfig(
    { dealId, documentId, lastUsedRenovatedConfig }: UpdateDocumentLastUsedRenovatedConfigConfigParams,
  ) {
    await updateDocumentLastUsedRenovatedConfigConfigApi(
      { urlParams: { dealId, documentId }, data: { lastUsedRenovatedConfig } },
    );
  }

  async getDocumentLastUsedAffordableConfig(dealId: string, documentId: string): Promise<AffordableConfiguration> {
    const { data: { lastUsedAffordableConfig } } = await getDocumentLastUsedAffordableConfigApi(
      { urlParams: { dealId, documentId } },
    );
    return lastUsedAffordableConfig;
  }

  async updateDocumentLastUsedAffordableConfig(
    { dealId, documentId, lastUsedAffordableConfig }: UpdateDocumentLastUsedAffordableConfigParams,
  ) {
    await updateDocumentLastUsedAffordableConfigApi(
      { urlParams: { dealId, documentId }, data: { lastUsedAffordableConfig } },
    );
  }

  async getDocumentLastUsedMtmConfig(dealId: string, documentId: string): Promise<MtmConfiguration> {
    const { data: { lastUsedMtmConfig } } = await getDocumentLastUsedMtmConfigApi(
      { urlParams: { dealId, documentId } },
    );
    return lastUsedMtmConfig;
  }

  async updateDocumentLastUsedMtmConfig(
    { dealId, documentId, lastUsedMtmConfig }: UpdateDocumentLastUsedMtmConfigParams,
  ) {
    await updateDocumentLastUsedMtmConfigApi(
      { urlParams: { dealId, documentId }, data: { lastUsedMtmConfig } },
    );
  }

  async validateDocument({ dealId, documentId, validate }: ValidateDocumentParams): Promise<Document> {
    const { data: { document } } = await validateDealDocumentApi({
      urlParams: { dealId, documentId },
      data: { validate },
    });
    return document;
  }

  async raiseTicket({ dealId, documentId, ticketParams }: RaiseTicketParams): Promise<void> {
    await raiseDocumentTicketApi({
      urlParams: { dealId, documentId },
      data: ticketParams,
    });
  }
}

export const useDealDocumentsService: () => DealDocumentsService = () => DealDocumentsService.useService();
