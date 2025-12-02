import { Deal, DealDocument } from '../../../../../../types';
import { useDealDocumentsService } from '../../../../../services/account/user/DealDocumentsService';
import React, { useCallback } from 'react';
import { Button, Flex, Heading, HStack, Icon, Text } from '@chakra-ui/react';
import { LinkIconButton } from '../../../../../../bootstrap/chakra/components/core/LinkButton';
import { GoBackIcon } from '../../../icons';
import { shortDateIso } from '../../../../../../bootstrap/utils/dateFormat';
import { ConfirmPopup } from '../../../../../../bootstrap/chakra/components/popups/ConfirmPopup';
import { FileIcon } from '../../../../core/FileIcon';
import { useIsSampleDeal } from '../../../../../hooks/deal/useIsSampleDeal';
import { useIsFreeAccount } from '../../../../../hooks/deal/useIsFreeAccount';
import { useMixPanelService } from '../../../../../services/MixPanelService';

interface DocumentDashboardHeaderProps {
  closeUrl: string;
  deal: Deal;
  document: DealDocument;
  onTriggerExportXlsx?: () => void;
}

export function DocumentDashboardHeader(
  {
    deal,
    closeUrl,
    document,
    onTriggerExportXlsx,
  }: DocumentDashboardHeaderProps,
) {
  const documentService = useDealDocumentsService();
  const validateMutation = documentService.useValidateDocumentMutation();

  const mixPanelService = useMixPanelService();
  const handleInvalidate = useCallback(async () => {
    await validateMutation.mutateAsync({ dealId: deal.id, documentId: document.id, validate: false });
    mixPanelService.trackDealDocumentInValidatedEvent(document, deal);
  }, [deal, document, validateMutation, mixPanelService]);
  const isSampleDeal = useIsSampleDeal(deal);
  const isFreeAccount = useIsFreeAccount();
  return (
    <Flex justify="space-between" p={2}>
      <HStack>
        <LinkIconButton
          href={closeUrl} aria-label="Go Back"
          icon={<Icon as={GoBackIcon} fontSize="3xl"/>}
          rounded="full"
        />
        <Heading size="sm">{document.name}</Heading>
        {document.documentType === 'RRF' && (
          <Flex>
            <Text fontSize="xs" fontWeight="medium">As Of Date:&nbsp;</Text>
            <Text fontSize="xs" fontWeight="normal">{shortDateIso(document.asOnDate)}</Text>
          </Flex>
        )}
      </HStack>
      <HStack>
        <ConfirmPopup
          title="Unlock Document?"
          message={`This action will unlock document to allow editing.
          The document will not be usable to generate models till it is marked validated again.
          Do you want to continue?`}
          okText="Yes"
          onConfirm={handleInvalidate}
        >
          <Button size="xs" colorScheme="warning" variant="secondary" isDisabled={isSampleDeal || isFreeAccount}>
            Unlock Document
          </Button>
        </ConfirmPopup>
        <Button
          size="xs" variant="secondary" leftIcon={<FileIcon fileName="abc.xls" fontSize="sm"/>}
          onClick={onTriggerExportXlsx} isDisabled={isFreeAccount}
        >Export Workbook</Button>
      </HStack>
    </Flex>
  );
}
