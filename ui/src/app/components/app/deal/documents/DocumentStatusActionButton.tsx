import { Icon, Text } from '@chakra-ui/react';
import { LinkButton } from '../../../../../bootstrap/chakra/components/core/LinkButton';
import { RoutingService } from '../../../../services/RoutingService';
import { OpenIcon } from '../../icons';
import React from 'react';
import { Deal, DealDocument } from '../../../../../types';

interface DocumentStatusActionButtonProps {
  deal: Deal;
  document: DealDocument;
  returnUrl?: string;
}

export function DocumentStatusActionButton({ deal, document, returnUrl }: DocumentStatusActionButtonProps) {
  let actionText = 'Review & Validate';
  if (document.status === 'Validated') {
    if (document.documentType === 'CF') {
      actionText = 'Cash Flow Dashboard';
    } else if (document.documentType === 'RRF') {
      actionText = 'Rent Roll Dashboard';
    }
  }
  if (document.status === 'Failed') {
    actionText = 'Re-process Document';
  }

  const documentPageUrl =
    `${RoutingService.userDealDocumentPage(deal?.slug, document.id)}${returnUrl ? `?onClose=${returnUrl}` : ''}`;

  return (
    <>
      {(document.status === 'Processed' || document.status === 'Validated') && (
        <LinkButton
          href={documentPageUrl} p={0} rightIcon={<Icon as={OpenIcon}/>}
        >
          <Text fontSize="sm">{actionText}</Text>
        </LinkButton>
      )}
      {document.status === 'Failed' &&
        <LinkButton href={documentPageUrl} p={0}>
          <Text fontSize="sm">{actionText}</Text>
        </LinkButton>
      }
      {document.status === 'Processing' &&
        <LinkButton href="" variant="ghost" p={0}>
          <Text fontSize="sm" color="gray.500">{actionText}</Text>
        </LinkButton>
      }
    </>
  );
}
