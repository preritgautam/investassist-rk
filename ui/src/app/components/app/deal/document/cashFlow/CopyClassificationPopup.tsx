import React, { ReactElement, useCallback, useMemo, useState } from 'react';
import { Deal, DealMatch } from '../../../../../../types';
import { useIsVisible } from '../../../../../../bootstrap/hooks/utils/useIsVisible';
import { ModalProps } from '@chakra-ui/modal';
import {
  Button, Flex, FlexProps, FormControl, Heading, HStack, Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay, Radio, Text, VStack,
} from '@chakra-ui/react';
import { useDealService } from '../../../../../services/account/user/DealService';
import { FlexCol } from '../../../../../../bootstrap/chakra/components/layouts/FlexCol';
import { useFieldValue } from '../../../../../../bootstrap/hooks/utils/useFieldValue';


interface DealRadioProps {
  deal: DealMatch;
  isChecked: boolean;
  onSelect: (dealId: string) => void;
  flexProps?: FlexProps;
}

function DealRadio({ deal, isChecked, onSelect, flexProps = {} }: DealRadioProps) {
  return (
    <Flex
      justify="space-between" align="center" border="1px" borderColor="border.500" rounded="sm" py={2} px={4}
      cursor="pointer" onClick={() => onSelect(deal.dealId)}
      {...flexProps}
    >
      <HStack flexGrow={1}>
        <Radio value={deal.dealId} isChecked={isChecked} onClick={() => onSelect(deal.dealId)}/>
        <Heading size="xs" color="primary.500">{deal.dealName}</Heading>
      </HStack>
      <VStack spacing={0} align="flex-start">
        <HStack>
          <Text fontSize="xs" fontWeight="bold">Matches:</Text>
          <Text fontSize="xs">{Number(deal.matchPercent).toFixed(2)}%</Text>
        </HStack>
        <HStack>
          <Text fontSize="xs" fontWeight="bold">No. of line items:</Text>
          <Text fontSize="xs">{deal.matchCount}</Text>
        </HStack>
      </VStack>
    </Flex>
  );
}


export interface CopyClassificationPopupProps extends Omit<ModalProps, 'children'> {
  deals?: DealMatch[];
  onCopyClassification: (dealId: string) => void;
}

export function CopyClassificationPopup(
  { isOpen, onClose, deals, onCopyClassification }: CopyClassificationPopupProps,
) {
  const [selectedDealId, setSelectedDealId] = useState<string>(deals?.[0]?.dealId);
  const [recommended, ...restDeals] = deals ?? [];
  const [working, setWorking] = useState<boolean>(false);
  const [filterText, handleChangeFilterText] = useFieldValue();

  const handleCopy = useCallback(async () => {
    setWorking(true);
    await onCopyClassification(selectedDealId);
    setWorking(false);
    onClose();
  }, [onCopyClassification, selectedDealId, onClose]);

  const filteredDeals = useMemo(() => {
    return restDeals.filter((deal: DealMatch) => deal.dealName.toLowerCase().includes(filterText.toLowerCase()));
  }, [filterText, restDeals]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" scrollBehavior="inside">
      <ModalOverlay/>
      <ModalContent>
        <ModalHeader>Copy Classification</ModalHeader>
        <ModalCloseButton/>
        <ModalBody display="flex" flexDirection="column" minH={0} overflow="auto">
          {!!recommended && (
            <>
              <Heading size="xs" mb={2}>Recommended Deal</Heading>
              <DealRadio
                deal={recommended} isChecked={selectedDealId === recommended.dealId} onSelect={setSelectedDealId}
                flexProps={{ my: 2 }}
              />
            </>
          )}
          {restDeals.length > 0 && (
            <>
              <Heading size="xs" mb={2} mt={4}>Other Deals</Heading>
              <FormControl>
                <Input placeholder="Search deal with name" value={filterText} onChange={handleChangeFilterText}/>
              </FormControl>
              <FlexCol>
                {filteredDeals.map((deal) => (
                  <DealRadio
                    key={deal.dealId} deal={deal} isChecked={selectedDealId === deal.dealId}
                    onSelect={setSelectedDealId}
                    flexProps={{ my: 2 }}
                  />
                ))}
              </FlexCol>
            </>
          )}
        </ModalBody>
        <ModalFooter>
          <HStack>
            <Button variant="outline" onClick={onClose} isDisabled={working}>Cancel</Button>
            <Button mr={3} onClick={handleCopy} isLoading={working}>Copy</Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export function useCopyClassification(deal: Deal, onCopyClassification: (string) => void): [ReactElement, () => void] {
  const [isOpen, show, hide] = useIsVisible();
  const dealService = useDealService();
  const cfMatchingDealsQuery = dealService.useCFMatchingDeals(deal.id);

  const handleShow = useCallback(async () => {
    show();
    await cfMatchingDealsQuery.refetch();
  }, [cfMatchingDealsQuery, show]);

  const popup = (
    <CopyClassificationPopup
      isOpen={isOpen} onClose={hide} deals={cfMatchingDealsQuery.data}
      onCopyClassification={onCopyClassification}
    />
  );

  return [popup, handleShow];
}
