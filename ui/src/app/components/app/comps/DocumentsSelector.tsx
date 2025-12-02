import { useMap } from 'react-use';
import React, { useCallback } from 'react';
import { Deal, DealDocument, DealDocumentType } from '../../../../types';
import { useDealDocumentsService } from '../../../services/account/user/DealDocumentsService';
import { FlexCol } from '../../../../bootstrap/chakra/components/layouts/FlexCol';
import { Button, Flex, Heading, HStack, Radio, RadioGroup, Text } from '@chakra-ui/react';
import { dayMonthYearDateIso, monthYearDateIso } from '../../../../bootstrap/utils/dateFormat';

export interface DocumentsSelectorProps {
  deals: Deal[];
  documentType: DealDocumentType;
  onCompare: (selectedDocument: Record<string, string>) => void;
  onRollup: (selectedDocument: Record<string, string>) => void;
}

export function DocumentsSelector({ deals, documentType, onCompare, onRollup }: DocumentsSelectorProps) {
  const [selectedDocuments, { set, get }] = useMap<Record<string, string>>({});
  const selectDocument = useCallback((dealId: string, documentId: string) => {
    set(dealId, documentId);
  }, [set]);

  const dealIds = deals.map((deal: Deal) => deal.id);
  const documentsQueries = useDealDocumentsService().useMultipleDealsDocuments(dealIds);
  const dealDocuments: DealDocument[][] = documentsQueries.map((dq) => dq.data);

  const dealDocumentsMap: Record<string, DealDocument[]> = dealIds.reduce((map, dealId, index) => {
    map[dealId] = (dealDocuments[index] ?? []).filter((doc: DealDocument) => doc.documentType === documentType);
    return map;
  }, {});

  if (dealDocuments.some((dd) => !dd)) {
    return (
      <div>Loading..</div>
    );
  }

  return (
    <FlexCol>
      <Flex justifyContent="space-between" mt={4} mb={2}>
        <Heading>Select Documents to Compare</Heading>
        <HStack>
          <Button
            isDisabled={Reflect.ownKeys(selectedDocuments).length < 2}
            onClick={() => onCompare(selectedDocuments)} variant="outline"
          >Show Comparables</Button>
          <Button
            isDisabled={Reflect.ownKeys(selectedDocuments).length < 2}
            onClick={() => onRollup(selectedDocuments)} variant="outline"
          >Show Rollup</Button>
        </HStack>
      </Flex>
      {deals.map((deal: Deal) => (
        <FlexCol key={deal.id} mb={4}>
          <Heading size="sm" mb={2}>{deal.name}</Heading>
          <RadioGroup onChange={(docId) => selectDocument(deal.id, docId)} value={get(deal.id)} ml={4}>
            <FlexCol>
              {dealDocumentsMap[deal.id].map((document: DealDocument) => (
                <Radio
                  value={document.id} key={document.id} isDisabled={document.status !== 'Validated'}
                  mt={-5} mb={1}
                >
                  <FlexCol mt={5}>
                    <Text fontWeight="bold">{document.name}</Text>
                    {documentType === 'CF' && (
                      <Text fontSize="xs">
                        Period: {monthYearDateIso(document.periodFrom)} - {monthYearDateIso(document.periodTo)}
                      </Text>
                    )}
                    {documentType === 'RRF' && (
                      <Text fontSize="xs">
                        As on: {dayMonthYearDateIso(document.asOnDate)}
                      </Text>
                    )}
                  </FlexCol>
                </Radio>
              ))}
            </FlexCol>
          </RadioGroup>
        </FlexCol>
      ))}
    </FlexCol>
  );
}
