import { useCallback, useState } from 'react';
import { useDealDocumentsService } from '../../services/account/user/DealDocumentsService';
import { Deal, DealDocument } from '../../../types';
import { useSimpleToast } from '../utils/useSimpleToast';
import { useMixPanelService } from '../../services/MixPanelService';

export interface UseDeleteDealDocumentProps {
  deal: Deal;
  document: DealDocument;
}

export type UseDeleteDealDocumentReturn = [() => Promise<any>, boolean]

export function useDeleteDealDocument({ deal, document }: UseDeleteDealDocumentProps): UseDeleteDealDocumentReturn {
  const dealDocumentsService = useDealDocumentsService();
  const { deleteDealDocumentQuery } = dealDocumentsService.useQueries(deal.id);
  const [isDeleting, setIsDeleting] = useState(false);
  const toast = useSimpleToast();
  const mixPanelService = useMixPanelService();
  const handleDelete = useCallback(async () => {
    setIsDeleting(true);
    await deleteDealDocumentQuery.mutateAsync(document.id, {
      onSuccess() {
        toast({
          title: 'Success!',
          description: `Successfully deleted document - ${document.name}`,
          status: 'success',
        });
        mixPanelService.trackDealDocumentDeletedEvent(document, deal);
      },
      onSettled() {
        setIsDeleting(false);
      },
    });
  }, [document, deleteDealDocumentQuery, toast, deal, mixPanelService]);
  return [handleDelete, isDeleting];
}
