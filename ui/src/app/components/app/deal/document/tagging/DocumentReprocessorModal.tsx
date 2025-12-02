import { useDealDocumentsService } from '../../../../../services/account/user/DealDocumentsService';
import React, { useCallback, useState } from 'react';
import { ConfirmData, DealDocumentTaggerModal } from './DealDocumentTaggerModal';
import { Deal, DealDocument, DealDocumentFileData } from '../../../../../../types';

interface DocumentReprocessorModalProps {
  isOpen: boolean,
  onClose: () => void;
  file: DealDocumentFileData,
}

export function DocumentReprocessorModal({ isOpen, onClose, file }: DocumentReprocessorModalProps) {
  const dealDocumentsService = useDealDocumentsService();
  const { reprocessDealDocumentQuery } = dealDocumentsService.useQueries(file?.deal.id);

  const handleReprocessConfirm = useCallback(async (data: ConfirmData) => {
    onClose();
    const { startPage, endPage } = data;
    const { document } = data.file as DealDocumentFileData;
    await reprocessDealDocumentQuery.mutateAsync({
      documentId: document.id, startPage, endPage,
    });
  }, [reprocessDealDocumentQuery, onClose]);

  return (
    <DealDocumentTaggerModal
      isOpen={isOpen} file={file} onClose={onClose} onConfirm={handleReprocessConfirm}
    />
  );
}

export function useDocumentReprocessor() {
  const [file, setFile] = useState<DealDocumentFileData>(null);
  const clearFile = () => setFile(null);

  const handleReprocess = useCallback((deal: Deal, document: DealDocument) => {
    setFile({ deal, document });
  }, []);

  const reprocessor = <DocumentReprocessorModal onClose={clearFile} file={file} isOpen={!!file}/>;

  return { reprocessor, handleReprocess };
}
