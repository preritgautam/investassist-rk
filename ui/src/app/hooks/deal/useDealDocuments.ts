import { useDealDocumentsService } from '../../services/account/user/DealDocumentsService';
import { Deal, DealDocument } from '../../../types';
import { noopArray } from '../../../bootstrap/utils/noop';
import { UseQueryOptions } from 'react-query';

export function useDealDocuments(deal: Deal, options: UseQueryOptions<DealDocument[]> = {}) {
  const dealDocumentsService = useDealDocumentsService();
  const { useDealDocuments } = dealDocumentsService.useQueries(deal?.id);
  const documentsQuery = useDealDocuments(options);

  const documents = documentsQuery.data ?? noopArray;
  const cfDocuments = documents.filter((document: DealDocument) => document.documentType === 'CF').reverse();
  const rrDocuments = documents.filter((document: DealDocument) => document.documentType === 'RRF').reverse();
  return {
    documents,
    cfDocuments,
    rrDocuments,
    isLoading: documentsQuery.isLoading,
  };
}
