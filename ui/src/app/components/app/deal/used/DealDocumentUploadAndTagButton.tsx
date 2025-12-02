import React, { useCallback } from 'react';
import { Deal, DealDocumentType } from '../../../../../types';
import { ButtonProps } from '@chakra-ui/react';
import { FileButton } from '../../../core/FileButton';
import { nanoid } from 'nanoid';
import { useMap } from 'react-use';
import { useDealDocumentsService } from '../../../../services/account/user/DealDocumentsService';
import { useMixPanelService } from '../../../../services/MixPanelService';
import { UploadIcon } from '../../icons';
import { useSimpleToast } from '../../../../hooks/utils/useSimpleToast';

export interface UploadData {
  percent: number,
  remainingTime: number,
  fileName: string,
}

export interface DealDocumentUploadAndTagButtonProps extends ButtonProps {
  deal: Deal;
  documentType: DealDocumentType,
  setUpload: (id: string, data: UploadData) => void;
  removeUpload: (id: string) => void,
}

export function DealDocumentUploadAndTagButton(
  { deal, documentType, setUpload, removeUpload, children, ...rest }: DealDocumentUploadAndTagButtonProps,
) {
  const dealDocumentsService = useDealDocumentsService();
  const { addDealDocumentQuery } = dealDocumentsService.useQueries(deal.id);

  const mixPanelService = useMixPanelService();

  const toast = useSimpleToast();

  const onFileSelect = useCallback(async (file: File) => {
    const uploadId = nanoid();
    setUpload(uploadId, { percent: 0, remainingTime: -1, fileName: file.name });
    try {
      const document = await addDealDocumentQuery.mutateAsync({
        dealId: deal.id,
        file,
        fileName: file.name,
        documentType: documentType,
        onProgress: (percent: number, remainingTime: number) => {
          setUpload(uploadId, { percent, remainingTime, fileName: file.name });
        },
        startPage: 0,
        endPage: 0,
      });
      mixPanelService.trackDealDocumentAddedEvent(document, deal);
    } catch (e) {
      toast({
        title: 'Failed!',
        description: 'Document upload failed.',
        status: 'error',
      });
    }
    removeUpload(uploadId);
  }, [addDealDocumentQuery, deal, setUpload, removeUpload, documentType, mixPanelService, toast]);

  return (
    <FileButton
      variant="ghost"
      leftIcon={<UploadIcon/>}
      resetAfterSelect={true} onFileSelect={onFileSelect}
      {...rest}
    >{children}</FileButton>
  );
}

export interface UseDealDocumentUploadAndTagButtonProps {
  deal: Deal,
  documentType: DealDocumentType,
  buttonProps?: ButtonProps,
}

export function useDealDocumentUploadAndTagButton(
  { deal, documentType, buttonProps }: UseDealDocumentUploadAndTagButtonProps,
) {
  const [uploads, { set: setUpload, remove: removeUpload }] = useMap<Record<string, UploadData>>({});
  const uploadButton = (
    <DealDocumentUploadAndTagButton
      deal={deal} documentType={documentType} setUpload={setUpload} removeUpload={removeUpload} {...buttonProps}
    />
  );
  return { uploads, uploadButton };
}
