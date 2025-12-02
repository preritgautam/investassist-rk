import React from 'react';
import { Box, Icon, IconButton, IconButtonProps } from '@chakra-ui/react';
import { Deal, DealDocument } from '../../../../../types';
import { useDeleteDealDocument } from '../../../../hooks/deal/useDeleteDealDocument';
import { ConfirmPopup } from '../../../../../bootstrap/chakra/components/popups/ConfirmPopup';
import { DeleteIcon } from '../../icons';
import { Tooltip } from '../../../core/Tooltip';


interface DeleteDealDocumentButtonProps extends IconButtonProps {
  deal: Deal,
  document: DealDocument,
}

export function DeleteDealDocumentIconButton({ deal, document, ...rest }: DeleteDealDocumentButtonProps) {
  const [handleDelete, isDeleting] = useDeleteDealDocument({ deal, document });

  return (
    <Tooltip label={'Delete Document'}>
      <Box>
        <ConfirmPopup
          title="Delete Document?"
          message={`Are you sure you want to delete document - ${document.name}`}
          onConfirm={handleDelete}
          colorScheme="danger"
        >
          <IconButton
            isLoading={isDeleting} colorScheme="secondary"
            {...rest} variant="ghost"
            icon={<Icon as={DeleteIcon}/>}
            className="document-action-button danger"
          />
        </ConfirmPopup>
      </Box>
    </Tooltip>
  );
}
