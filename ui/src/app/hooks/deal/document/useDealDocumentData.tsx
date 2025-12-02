import { DocumentData, ExtractedData } from '../../../../types';
import { useDealDocumentsService } from '../../../services/account/user/DealDocumentsService';
import { useCallback } from 'react';

interface UseDealDocumentDataReturn {
  documentData: DocumentData;
  isLoading: boolean;
  saveDocumentData: (editedData: ExtractedData) => Promise<void>;
  isSaving: boolean;
}

export function useDealDocumentData(dealId: string, documentId: string): UseDealDocumentDataReturn {
  const docService = useDealDocumentsService();
  const { data: documentData, isLoading } = docService.useDocumentData(dealId, documentId);
  const updateMutation = docService.useUpdateDocumentDataMutation();
  const saveDocumentData = useCallback(async (editedData: ExtractedData) => {
    await updateMutation.mutateAsync({ dealId, documentId, editedData });
  }, [updateMutation, dealId, documentId]);

  return {
    documentData, isLoading,
    saveDocumentData, isSaving: updateMutation.isLoading,
  };
}
