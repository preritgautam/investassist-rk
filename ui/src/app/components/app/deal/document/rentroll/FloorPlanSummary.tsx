import { Deal, DealDocument, RRFExtractedData } from '../../../../../../types';
import { useRentRollDataService } from '../../../../../services/document/RentRollDataService';
import React, { useMemo } from 'react';
import { FlexCol } from '../../../../../../bootstrap/chakra/components/layouts/FlexCol';
import { Flex, Heading, Text } from '@chakra-ui/react';
import { RRUnitInformationField } from '../../../../../enums/RentRollFieldEnum';
import { Numeric } from '../../../../core/Amount';
import { useDealDocumentsService } from '../../../../../services/account/user/DealDocumentsService';

interface FloorPlanSummaryProps {
  data: RRFExtractedData;
  deal: Deal;
  document: DealDocument;
}

export function FloorPlanSummary({ data, deal, document }: FloorPlanSummaryProps) {
  const rentRollDataService = useRentRollDataService();
  const dealDocumentService = useDealDocumentsService();
  const { data: occupancyConfig } = dealDocumentService.useOccupancyConfig(deal.id, document.id);
  const fpSummary = useMemo(
    () => rentRollDataService.getFloorPlanSummary(data, occupancyConfig),
    [rentRollDataService, data, occupancyConfig],
  );
  const totalUnits = useMemo(
    () => Reflect.ownKeys(fpSummary.summary).reduce(
      (units, fp: string) => ({
        occupied: units.occupied + fpSummary.summary[fp].unitsOccupied,
        total: units.total + fpSummary.summary[fp].unitCount,
      }),
      { occupied: 0, total: 0 },
    ),
    [fpSummary],
  );

  if (fpSummary.floorPlanColumn === null) {
    return (
      <FlexCol justify="center" align="center" w="full">
        <Heading color="warning.500" mb={4}>Oops!</Heading>
        <Text w={64} textAlign="center">There is insufficient data to show a floor plan summary</Text>
      </FlexCol>
    );
  }

  return (
    <FlexCol flexGrow={1}>
      {fpSummary.floorPlanColumn !== RRUnitInformationField.floorPlan && (
        <Heading size="xs" ml={4} mt={4}>Summary By {fpSummary.floorPlanColumn.label}</Heading>
      )}
      <FlexCol flexGrow={1} p={4}>
        {Reflect.ownKeys(fpSummary.summary).map((floorPlan: string) => (
          <FlexCol
            key={floorPlan} bg="gray.50" p={2} rounded="lg" border="1px solid" borderColor="gray.300" mb={2}
            flexShrink={0}
          >
            <Flex justify="space-between">
              <Text fontSize="xs">{floorPlan ?? '[Empty]'} (Occupied/Units)</Text>
              <Text fontSize="xs" fontWeight="bold">
                {fpSummary.summary[floorPlan].unitsOccupied}/{fpSummary.summary[floorPlan].unitCount}
              </Text>
            </Flex>
            <Flex justify="space-between" mt={2}>
              <Text fontSize="x-small">Avg. SqFt</Text>
              <Numeric fontSize="x-small" value={fpSummary.summary[floorPlan].averageSqFt}/>
            </Flex>
          </FlexCol>
        ))}
      </FlexCol>
      <Flex
        justify="space-between"
        bg="gray.700" p={4} roundedBottom="lg" border="1px solid" borderColor="gray.900" mt={4}
        color="gray.50"
      >
        <Text fontSize="sm">Total Units (Occupied/Units)</Text>
        <Text fontSize="sm" fontWeight="bold">{totalUnits.occupied}/{totalUnits.total}</Text>
      </Flex>
    </FlexCol>
  );
}
