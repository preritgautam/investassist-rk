import React, { useCallback, useState } from 'react';
import { FlexCol, FlexColProps } from '../../../../../../bootstrap/chakra/components/layouts/FlexCol';
import { RRDiscrepancies, RRDiscrepancy } from '../../../../../../types';
import {
  Heading,
  Text,
  HStack,
  IconButton, Flex, Icon,
} from '@chakra-ui/react';
import { CloseIcon } from '../../../icons';
import { formatAmount } from '../../../../../services/utils/utils';

export interface RentRollDiscrepanciesProps extends FlexColProps {
  data: RRDiscrepancies,
  onToggleView: () => void,
  highlightRow: (row: number) => void,
}

export function RentRollDiscrepancies({ data, onToggleView, highlightRow }: RentRollDiscrepanciesProps) {
  const noOfUnits = Reflect.ownKeys(data).length;
  const [selectedUnit, setSelectedUnit] = useState(null);
  const handleClick = useCallback( (unit, row) => {
    highlightRow(row);
    setSelectedUnit(unit);
  }, [highlightRow]);

  const handleClose = useCallback(( ) => {
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
        <Text p={2} fontSize="sm">Discrepancies Detected in {noOfUnits} units</Text>
      </Flex>
      <FlexCol gap={4} p={4}>
        {!!noOfUnits && (
          Reflect.ownKeys(data).map((unitNo: string) => (
            <FlexCol
              key={unitNo} border="1px solid" overflow="scroll" rounded="sm" cursor="pointer"
              borderColor="secondary.200" bg={unitNo=== selectedUnit ?'primary.50':'white'} flexShrink={0}
            >
              <Text
                fontSize="xs" p={2} bg="secondary.50" borderBottom="1px" borderColor="border.500"
                fontWeight="semibold"
              >Unit {unitNo}</Text>
              {(data[unitNo].map((discrepancy: RRDiscrepancy, index: number) => (
                <FlexCol p={2} key={index} onClick={() => handleClick(unitNo, discrepancy?.row)}>
                  <Text fontSize="sm">{discrepancy.message}</Text>
                  {discrepancy.type === 'MonthlyMarketRentRatio' && (
                    <>
                      <HStack>
                        <Text fontSize="sm" fontWeight="medium">Market Rent:</Text>
                        <Text fontSize="sm">{formatAmount(discrepancy.marketRent)}</Text>
                      </HStack>
                      <HStack>
                        <Text fontSize="sm" fontWeight="medium">Monthly Rent:</Text>
                        <Text fontSize="sm">{formatAmount(discrepancy.monthlyRent)}</Text>
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
