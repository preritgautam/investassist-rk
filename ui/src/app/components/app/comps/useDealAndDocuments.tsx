import { Deal, DealDocument } from '../../../../types';
import { useDealService } from '../../../services/account/user/DealService';
import { useDealDocumentsService } from '../../../services/account/user/DealDocumentsService';

export function useDealAndDocuments(dealAndDocs: [string, string][]) {
  const dealIds = dealAndDocs.map(([dealId]) => dealId);
  const deals: Deal[] = useDealService().useMultipleDealsById(dealIds).map((q) => q.data);
  const documents: DealDocument[] =
    useDealDocumentsService().useMultipleDealDocuments(dealAndDocs).map((q) => q.data);

  return { deals, documents };
}
