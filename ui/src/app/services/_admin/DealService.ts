import { Service } from '../../../bootstrap/service/Service';
import { Deal, DealDocument } from '../../../types';
import { getAccountDealsApi, getDealDocumentsApi, getDealsReportFileApi, getDocumentFileApi } from '../../api/_admin';
import { useQuery, UseQueryOptions } from 'react-query';
import { saveAs } from 'file-saver';
import { DateTime } from 'luxon';


export class DealService extends Service {
  useAccountDeals(accountId: string, options: UseQueryOptions<Deal[], Error> = {}) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useQuery<Deal[], Error>(
      ['admin-account-deals', accountId],
      async () => {
        const { data: { deals } } = await getAccountDealsApi({ urlParams: accountId });
        return deals;
      },
      options,
    );
  }

  useDealDocuments(dealId: string, options: UseQueryOptions<DealDocument[], Error> = {}) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useQuery<DealDocument[], Error>(
      ['admin-deal-documents', dealId],
      async () => {
        const { data: { documents } } = await getDealDocumentsApi({ urlParams: dealId });
        return documents;
      },
    );
  }

  async downloadDealDocumentFile(documentId: string, documentName: string): Promise<any> {
    const response = await getDocumentFileApi({ urlParams: { documentId } });
    return saveAs(response.data, documentName);
  }

  async downloadDealReportFile(): Promise<any> {
    const response = await getDealsReportFileApi();
    const d = DateTime.now().toLocaleString(DateTime.DATE_SHORT);
    return saveAs(response.data, `DealsReport_${d}.csv`);
  }
}

export const useDealService: () => DealService = () => DealService.useService();
