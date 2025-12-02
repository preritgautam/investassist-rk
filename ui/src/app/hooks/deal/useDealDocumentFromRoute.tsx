import { Deal, DealDocument } from '../../../types';
import { useQueryParam } from '../../../bootstrap/hooks/utils/useQueryParam';
import { useDealByRouteSlug } from './useDealByRouteSlug';
import { useDealDocumentsService } from '../../services/account/user/DealDocumentsService';

type UseDealByRouteSlugReturn = [Deal | null, DealDocument | null, boolean];

export function useDealDocumentFromRoute(): UseDealByRouteSlugReturn {
  const [deal, dealIsLoading] = useDealByRouteSlug({
    refetchInterval: false,
    refetchOnWindowFocus: false,
    refetchIntervalInBackground: false,
  });

  const documentId = useQueryParam('documentId');
  const dealDocumentService = useDealDocumentsService();
  const documentQuery = dealDocumentService.useDealDocument(deal?.id, documentId, {
    refetchInterval: false,
    refetchOnWindowFocus: false,
    refetchIntervalInBackground: false,
  });

  const { data: document, isLoading } = documentQuery;
  return [deal, document, isLoading || dealIsLoading];
}
