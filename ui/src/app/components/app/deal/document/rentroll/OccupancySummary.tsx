import { RRFExtractedData } from '../../../../../../types';
import { useRentRollDataService } from '../../../../../services/document/RentRollDataService';
import React, { useMemo } from 'react';
import { FlexCol } from '../../../../../../bootstrap/chakra/components/layouts/FlexCol';
import { Flex, Heading, Text } from '@chakra-ui/react';

interface OccupancySummaryProps {
  data: RRFExtractedData;
}

export function OccupancySummary({ data }: OccupancySummaryProps) {
  const rentRollDataService = useRentRollDataService();
  const occSummary = useMemo(() => rentRollDataService.getOccupancySummary(data), [rentRollDataService, data]);
  const totalUnits = useMemo(
    () => Reflect.ownKeys(occSummary.summary).reduce((total, oc: string) => total + occSummary.summary[oc].count, 0),
    [occSummary],
  );

  if (Reflect.ownKeys(occSummary.summary).length === 0) {
    return (
      <FlexCol justify="center" align="center" w="full">
        <Heading color="warning.500" mb={4}>Oops!</Heading>
        <Text w={64} textAlign="center">There is insufficient data to show an occupancy summary</Text>
      </FlexCol>
    );
  }

  return (
    <FlexCol flexGrow={1}>
      <FlexCol flexGrow={1} p={4}>
        {Reflect.ownKeys(occSummary.summary).map((occupancyCode: string) => (
          <Flex
            key={occupancyCode} justify="space-between"
            bg="gray.50" p={2} rounded="lg" border="1px solid" borderColor="gray.300" mb={2}
          >
            <Text fontSize="xs">{occupancyCode ?? '[Empty]'} Units</Text>
            <Text fontSize="xs" fontWeight="bold">{occSummary.summary[occupancyCode].count}</Text>
          </Flex>
        ))}
      </FlexCol>
      <Flex
        justify="space-between"
        bg="gray.700" p={4} roundedBottom="lg" border="1px solid" borderColor="gray.900" mt={4}
        color="gray.50"
      >
        <Text fontSize="sm">Total Units</Text>
        <Text fontSize="sm" fontWeight="bold">{totalUnits}</Text>
      </Flex>
    </FlexCol>
  );
}
