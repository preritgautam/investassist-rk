import React, { useCallback, useMemo, useState } from 'react';
import { Deal, DealDocument } from '../../../../../types';
import {
  Box,
  Checkbox,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  Tooltip,
  CheckboxProps,
} from '@chakra-ui/react';
import { dealDocumentTypeLabel } from '../../../../services/utils/utils';
import { DocumentReprocessorModal } from '../document/tagging/DocumentReprocessorModal';
import { LinkButton } from '../../../../../bootstrap/chakra/components/core/LinkButton';
import { RoutingService } from '../../../../services/RoutingService';
import { FileIcon } from '../../../core/FileIcon';
import { DocumentStatusLabel } from './DocumentStatusLabel';
import { DocumentStatusActionButton } from './DocumentStatusActionButton';
import { DocumentPeriodLabel } from './DocumentPeriodLabel';
import { FlexCol } from '../../../../../bootstrap/chakra/components/layouts/FlexCol';

interface DocumentRowProps {
  deal: Deal;
  document: DealDocument;
  onToggleSelected: CheckboxProps['onChange'];
  selected: boolean;
  isSampleDeal: boolean;
}

function DocumentRow({ deal, document, onToggleSelected, selected, isSampleDeal }: DocumentRowProps) {
  const isDisabled = document.status !== 'Validated';
  const [reprocessOpen, setReprocessOpen] = useState(false);

  const handleClose = useCallback(async () => {
    setReprocessOpen(false);
  }, []);
  const dealDoc = useMemo(() => ({ deal, document }), [deal, document]);

  if (reprocessOpen) {
    return (<DocumentReprocessorModal file={dealDoc} onClose={handleClose} isOpen={reprocessOpen}/>);
  }

  return (
    <>
      <Tr _hover={{ bg: 'primary.50' }} className="document-row">
        <Td pr={0} verticalAlign="top">
          <Tooltip
            shouldWrapChildren={true}
            label={
              isDisabled ? 'The document needs to be validated before it can be used to generate models' :
                ''
            }
          >
            <Checkbox
              onChange={onToggleSelected} isChecked={selected} isDisabled={isDisabled || isSampleDeal}
              size="md"
            />
          </Tooltip>
        </Td>
        <Td pr={0} verticalAlign="top"><FileIcon fileName={document.name}/></Td>
        <Td pl={1}>
          <FlexCol>
            <Tooltip label={document.name} openDelay={1000} shouldWrapChildren={true}>
              <LinkButton
                href={`${RoutingService.userDealDocumentPage(deal?.slug, document.id)}?onClose=models`}
              >
                <Text fontSize="sm" color="black" fontWeight={4} maxW={240} overflow="hidden" textOverflow="ellipsis">
                  {document.name}
                </Text>
              </LinkButton>
            </Tooltip>
            <DocumentPeriodLabel document={document}/>
          </FlexCol>
        </Td>
        <Td><Text fontSize="sm">{dealDocumentTypeLabel(document.documentType)}</Text></Td>
        <Td><DocumentStatusLabel document={document}/></Td>
        <Td><DocumentStatusActionButton deal={deal} document={document} returnUrl="models"/></Td>
      </Tr>
    </>
  );
}


export interface ModelDocumentsTableProps {
  deal: Deal;
  rrDocuments: DealDocument[];
  cfDocuments: DealDocument[];
  onDocumentSelectionChange: (documents: DealDocument[]) => void;
  selectedDocuments: DealDocument[];
  isSampleDeal: boolean;
}

export function ModelDocumentsTable(
  {
    deal,
    rrDocuments,
    cfDocuments,
    onDocumentSelectionChange,
    selectedDocuments,
    isSampleDeal,
  }: ModelDocumentsTableProps,
) {
  const addRemoveAll = useCallback((e) => {
    if (e.target.checked) {
      const validatedDocs = [...rrDocuments, ...cfDocuments].filter((d) => d.status === 'Validated');
      onDocumentSelectionChange(validatedDocs);
    } else {
      onDocumentSelectionChange([]);
    }
  }, [rrDocuments, cfDocuments, onDocumentSelectionChange]);

  const selectorState = useMemo(() => {
    const selectableCount = [...rrDocuments, ...cfDocuments].filter((d) => d.status === 'Validated').length;
    const selectedCount = selectedDocuments.length;
    return {
      isChecked: selectedCount === selectableCount && selectableCount > 0,
      isIndeterminate: selectedCount > 0 && selectedCount !== selectableCount,
      isDisabled: isSampleDeal || selectableCount === 0,
    };
  }, [selectedDocuments, rrDocuments, cfDocuments, isSampleDeal]);

  const handleSelect = useCallback((d: DealDocument, selected: boolean) => {
    if (selected) {
      let alreadySelectedDocs = [...selectedDocuments];
      if (d.documentType === 'RRF') {
        alreadySelectedDocs = alreadySelectedDocs.filter((doc) => doc.documentType !== 'RRF');
      }
      onDocumentSelectionChange([...alreadySelectedDocs, d]);
    } else {
      onDocumentSelectionChange(selectedDocuments.filter((sd) => sd !== d));
    }
  }, [onDocumentSelectionChange, selectedDocuments]);

  return (
    <Box
      as={TableContainer} minH={0} overflow="auto" rounded="sm" border="1px solid" borderColor="border.500" m={4} mt={0}
    >
      <Table colorScheme="gray">
        <Thead bg="gray.50">
          <Tr>
            <Th w={2} pr={0}>
              <Checkbox size="md" onChange={addRemoveAll} {...selectorState}/>
            </Th>
            <Th w={2} pr={0}></Th>
            <Th py={6} pl={1}>
              Document Name
            </Th>
            <Th>Document Type</Th>
            <Th>Status</Th>
            <Th></Th>
            {/* <Th w={0}></Th>*/}
          </Tr>
        </Thead>
        <Tbody>
          {rrDocuments.map((rr) => (
            <DocumentRow
              key={rr.id} deal={deal} document={rr}
              onToggleSelected={(e) => handleSelect(rr, e.target.checked)}
              selected={selectedDocuments.includes(rr)} isSampleDeal={isSampleDeal}
            />
          ))}
          {cfDocuments.map((cf) => (
            <DocumentRow
              key={cf.id} deal={deal} document={cf}
              onToggleSelected={(e) => handleSelect(cf, e.target.checked)}
              selected={selectedDocuments.includes(cf)} isSampleDeal={isSampleDeal}
            />
          ))}
        </Tbody>
      </Table>
    </Box>
  );
}
