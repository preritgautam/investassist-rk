import React, { useCallback, useState } from 'react';
import { FlexCol, FlexColProps } from '../../../../../../bootstrap/chakra/components/layouts/FlexCol';
import { CFDiscrepancies, CFDiscrepancy } from '../../../../../../types';
import {
  Heading,
  Text,
  HStack,
  IconButton, Flex, Icon,
} from '@chakra-ui/react';
import { CloseIcon } from '../../../icons';
import { formatAmount } from '../../../../../services/utils/utils';

export interface CashFlowDiscrepanciesProps extends FlexColProps {
  data: CFDiscrepancies,
  onToggleView: () => void,
  highlightRow: (rows: number) => void,
}

export function CashFlowDiscrepancies({ data, onToggleView, highlightRow }: CashFlowDiscrepanciesProps) {
  const noOfLi = Reflect.ownKeys(data).length;
  const [selectedDiscrepancy, setSelectedDiscrepancy] = useState(null);
  const handleClick = useCallback((discrepancy, row) => {
    highlightRow(row);
    setSelectedDiscrepancy(discrepancy);
  }, [highlightRow]);

  const handleClose = useCallback(() => {
    onToggleView();
    highlightRow(null);
  }, [onToggleView, highlightRow]);


  return (
    <FlexCol border="1px solid" borderColor="border.500">
      <HStack justify="space-between">
        <Heading size="sm" p={2} borderBottomWidth={1}>Discrepancies Detected</Heading>
        <IconButton
          aria-label="close discrepancies" variant="ghost" colorScheme="dark"
          icon={<Icon as={CloseIcon}/>} onClick={handleClose}
        />
      </HStack>
      <Flex bg="danger.100" border="1px solid" borderColor="danger.500">
        <Text p={2} fontSize="sm">Discrepancies Detected in {noOfLi} line items</Text>
      </Flex>
      <FlexCol gap={4} p={4}>
        {!!noOfLi && (
          Reflect.ownKeys(data).map((li: string) => (
            <FlexCol
              key={li} border="1px solid" overflow="scroll" rounded="sm" cursor="pointer"
              borderColor="secondary.200" bg={li=== selectedDiscrepancy ?'primary.50':'white'} flexShrink={0}
              maxW={400}
            >
              <Text
                fontSize="xs" p={2} bg="secondary.50" borderBottom="1px" borderColor="border.500"
                fontWeight="semibold"
              >Line Item:  {li.split('__')[1]}</Text>
              {(data[li].map((discrepancy: CFDiscrepancy, index: number) => (
                <FlexCol p={2} key={index} onClick={() => handleClick(li, discrepancy?.row)}>
                  <Text fontSize="sm">{discrepancy.message}</Text>
                  {discrepancy.type === 'MonthlyNumberDeviation' && (
                    <>
                      <HStack>
                        <Text fontSize="sm" fontWeight="medium">Monthly Avg Amount:</Text>
                        <Text fontSize="sm">{formatAmount(discrepancy.avgMonthlyAmount)}</Text>
                      </HStack>
                      <HStack>
                        <Text fontSize="sm" fontWeight="medium">Deviation Months:</Text>
                        <Text fontSize="sm">{discrepancy.deviationMonths.join(', ')}</Text>
                      </HStack>
                    </>
                  )}
                </FlexCol>
              )))}
            </FlexCol>
          ))
        )}
      </FlexCol>
    </FlexCol>
  );
}
