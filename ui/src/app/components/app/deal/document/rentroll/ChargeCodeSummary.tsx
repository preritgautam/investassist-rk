import { RRFExtractedData } from '../../../../../../types';
import { useRentRollDataService } from '../../../../../services/document/RentRollDataService';
import React, { useMemo } from 'react';
import { FlexCol } from '../../../../../../bootstrap/chakra/components/layouts/FlexCol';
import { Flex, Text } from '@chakra-ui/react';
import { Amount } from '../../../../core/Amount';

interface ChargeCodeSummaryProps {
  data: RRFExtractedData;
}

export function ChargeCodeSummary({ data }: ChargeCodeSummaryProps) {
  const rentRollDataService = useRentRollDataService();
  const ccSummary = useMemo(() => rentRollDataService.getChargeCodeSummary(data), [data, rentRollDataService]);
  const total = useMemo(
    () => Reflect.ownKeys(ccSummary).reduce((total, cc: string) => total + ccSummary[cc], 0),
    [ccSummary],
  );
  return (
    <FlexCol flexGrow={1}>
      <FlexCol flexGrow={1} p={4}>
        {Reflect.ownKeys(ccSummary).map((chargeCode: string) => (
          <Flex
            key={chargeCode} justify="space-between"
            bg="gray.50" p={2} rounded="lg" border="1px solid" borderColor="gray.300" mb={2}
          >
            <Text fontSize="xs">{chargeCode}</Text>
            <Amount fontSize="xs" fontWeight="bold" amount={ccSummary[chargeCode]}/>
          </Flex>
        ))}
      </FlexCol>
      <Flex
        justify="space-between"
        bg="gray.700" p={4} roundedBottom="lg" border="1px solid" borderColor="gray.900" mt={4}
        color="gray.50"
      >
        <Text fontSize="sm">Total</Text>
        <Amount fontSize="sm" fontWeight="bold" amount={total}/>
      </Flex>
    </FlexCol>
  );
}
