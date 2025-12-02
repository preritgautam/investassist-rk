import React from 'react';
import { useRenameDocumentFilePopup } from '../used/RenameDocumentFilePopup';
import { Icon, IconButton, IconButtonProps, Tooltip } from '@chakra-ui/react';
import { EditIcon } from '../../icons';
import { Deal, DealDocument } from '../../../../../types';

interface RenameDealDocumentButtonProps extends IconButtonProps {
  deal: Deal,
  document: DealDocument,
}

export function RenameDealDocumentIconButton({ deal, document, ...rest }: RenameDealDocumentButtonProps) {
  const [renamePopup, show, , isRenaming] = useRenameDocumentFilePopup({ deal, document });
  return (
    <>
      <Tooltip label='Rename Document'>
        <IconButton
          isLoading={isRenaming}
          colorScheme="secondary" {...rest} variant="ghost"
          icon={<Icon as={EditIcon}/>} onClick={show}
          className="document-action-button"
        />
      </Tooltip>
      {renamePopup}
    </>
  );
}
