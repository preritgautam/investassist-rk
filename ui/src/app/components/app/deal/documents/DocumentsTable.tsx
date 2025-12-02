import { UploadData } from '../used/DealDocumentUploadAndTagButton';
import { Deal, DealDocument, DealDocumentType } from '../../../../../types';
import {
  Box,
  HStack,
  Icon,
  IconButton,
  Progress,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tooltip,
  Tr,
} from '@chakra-ui/react';
import React, { useCallback, useMemo, useState } from 'react';
import { FileIcon } from '../../../core/FileIcon';
import { dealDocumentTypeLabel, shortDate, todayShortDate } from '../../../../services/utils/utils';
import { DeleteIcon, EditIcon, RefreshIcon, HelpIcon } from '../../icons';
import { RenameDealDocumentIconButton } from '../document/RenameDealDocumentIconButton';
import { DeleteDealDocumentIconButton } from '../document/DeleteDealDocumentIconButton';
import { RoutingService } from '../../../../services/RoutingService';
import { LinkButton } from '../../../../../bootstrap/chakra/components/core/LinkButton';
import { DocumentReprocessorModal } from '../document/tagging/DocumentReprocessorModal';
import { DocumentStatusLabel } from './DocumentStatusLabel';
import { DocumentStatusActionButton } from './DocumentStatusActionButton';
import { DocumentPeriodLabel } from './DocumentPeriodLabel';
import { useRaiseTicketModal } from '../document/ticket/RaiseTicketFormModal';

interface DocumentUploadRowProps {
  upload: UploadData;
  documentType: DealDocumentType;
}

function DocumentUploadRow({ upload, documentType }: DocumentUploadRowProps) {
  return (
    <Tr>
      <Td pr={0}><FileIcon fileName={upload.fileName}/></Td>
      <Td py={2} pl={1}>
        <Text fontSize="sm" fontWeight="500" maxW={240} overflow="hidden" textOverflow="ellipsis" my={3}>
          {upload.fileName}
        </Text>
      </Td>
      <Td><Text fontSize="sm">{dealDocumentTypeLabel(documentType)}</Text></Td>
      <Td>
        <HStack>
          <Progress value={upload.percent} w={24}/>
          <Text fontSize="sm">{upload.percent}%</Text>
        </HStack>
      </Td>
      <Td fontSize="sm">{todayShortDate()}</Td>
      <Td>
        <LinkButton href="" variant="ghost" p={0}>
          <Text fontSize="sm" color="gray.500">Review & Validate</Text>
        </LinkButton>
      </Td>
      <Td>
        <HStack justify="flex-end">
          <IconButton
            colorScheme="secondary" variant="ghost" size="sm"
            icon={<Icon as={RefreshIcon}/>} disabled aria-label="reprocess document"
          />
          <IconButton
            colorScheme="danger" variant="ghost" size="sm"
            icon={<Icon as={DeleteIcon}/>} disabled aria-label="delete document"
          />
          <IconButton
            colorScheme="secondary" variant="ghost" size="sm"
            icon={<Icon as={EditIcon}/>} disabled aria-label="rename document"
          />
        </HStack>
      </Td>
    </Tr>
  );
}

interface DocumentRowProps {
  deal: Deal;
  document: DealDocument;
  isSampleDeal: boolean;
  isFreeAccount: boolean;
}

function DocumentRow({ deal, document, isSampleDeal, isFreeAccount }: DocumentRowProps) {
  const [raiseTicketModal, showRaiseTicketModal] = useRaiseTicketModal({ deal, document });
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
        <Td pr={0} verticalAlign="top"><FileIcon fileName={document.name}/></Td>
        <Td pl={1}>
          <Tooltip label={document.name} openDelay={1000} shouldWrapChildren={true}>
            <LinkButton
              href={RoutingService.userDealDocumentPage(deal.slug, document.id)}
              isDisabled={document.status === 'Processing'} underline={false}
            >
              <Text fontSize="sm" color="black" fontWeight={4} maxW={240} overflow="hidden" textOverflow="ellipsis">
                {document.name}
              </Text>
            </LinkButton>
          </Tooltip>
          <DocumentPeriodLabel document={document}/>
        </Td>
        <Td><Text fontSize="sm">{dealDocumentTypeLabel(document.documentType)}</Text></Td>
        <Td>
          <DocumentStatusLabel document={document}/>
        </Td>
        <Td fontSize="sm">{shortDate(document.createdAt)}</Td>
        <Td><DocumentStatusActionButton deal={deal} document={document}/></Td>
        <Td>
          <HStack justify="flex-end" spacing={0}>
            {['Failed', 'Processed'].includes(document.status) && (
              <Tooltip label="Raise Support Ticket">
                <IconButton
                  variant="ghost" colorScheme="secondary"
                  aria-label="raise document ticket"
                  icon={<HelpIcon/>}
                  onClick={showRaiseTicketModal}
                  className="document-action-button primary"
                  isDisabled={isSampleDeal || isFreeAccount}
                />
              </Tooltip>
            )}
            {raiseTicketModal}
            <Tooltip label="Reprocess Document">
              <IconButton
                variant="ghost" colorScheme="secondary"
                aria-label="Retag document"
                icon={<RefreshIcon/>}
                onClick={() => setReprocessOpen(true)}
                className="document-action-button warning"
                isDisabled={isSampleDeal || isFreeAccount}
              />
            </Tooltip>
            <DeleteDealDocumentIconButton
              aria-label="Delete Document" deal={deal} document={document} isDisabled={isSampleDeal || isFreeAccount}
            />
            <RenameDealDocumentIconButton
              aria-label="Rename Document" deal={deal} document={document} isDisabled={isSampleDeal || isFreeAccount}
            />
          </HStack>
        </Td>
      </Tr>
    </>
  );
}

interface DocumentsTableProps {
  deal: Deal;
  rrUploads: Record<string, UploadData>;
  cfUploads: Record<string, UploadData>;
  rrDocuments: DealDocument[];
  cfDocuments: DealDocument[];
  isSampleDeal: boolean;
  isFreeAccount: boolean;
}

export function DocumentsTable(
  { deal, rrUploads, cfUploads, rrDocuments, cfDocuments, isSampleDeal, isFreeAccount }: DocumentsTableProps,
) {
  return (
    <Box as={TableContainer} minH={0} overflow="auto" rounded="sm" border="1px solid" borderColor="border.500" m={4}>
      <Table colorScheme="gray">
        <Thead bg="gray.50">
          <Tr>
            <Th w={2} pr={0}></Th>
            <Th py={6} pl={1}>Document Name</Th>
            <Th>Document Type</Th>
            <Th>Status</Th>
            <Th>Uploaded On</Th>
            <Th></Th>
            <Th></Th>
          </Tr>
        </Thead>
        <Tbody>
          {Reflect.ownKeys(rrUploads).map((id) => (
            <DocumentUploadRow key={id as string} upload={rrUploads[id as string]} documentType="RRF"/>
          ))}
          {rrDocuments.map((rr) => (
            <DocumentRow key={rr.id} deal={deal} document={rr}
              isSampleDeal={isSampleDeal} isFreeAccount={isFreeAccount}/>
          ))}
          {Reflect.ownKeys(cfUploads).map((id) => (
            <DocumentUploadRow key={id as string} upload={cfUploads[id as string]} documentType="CF"/>
          ))}
          {cfDocuments.map((cf) => (
            <DocumentRow key={cf.id} deal={deal} document={cf}
              isSampleDeal={isSampleDeal} isFreeAccount={isFreeAccount}/>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
}
