import React, { useMemo } from 'react';
import { Deal, DealDocument, RRBedsUnitCountSummary, RRFExtractedData } from '../../../../../../../types';
import { FlexCol } from '../../../../../../../bootstrap/chakra/components/layouts/FlexCol';
import { Flex } from '@chakra-ui/react';
import { useDealDocumentData } from '../../../../../../hooks/deal/document/useDealDocumentData';
import { useDealDocumentsService } from '../../../../../../services/account/user/DealDocumentsService';
import { useRentRollDataService } from '../../../../../../services/document/RentRollDataService';
import { BedsUnitsCountChart } from '../summary/BedsUnitsCountChart';
import { OccupancyChart } from '../summary/OccupancyChart';
import { RenovatedChart } from '../summary/RenovatedChart';
import { AffordableChart } from '../summary/AffordableChart';
import { ChargeCodeChart } from '../summary/ChargeCodeChart';
import { NewLeasesChart } from '../summary/NewLeasesChart';
import { ChartWrapper } from '../../summary/ChartWrapper';


function useRentRollChartsData(deal: Deal, document: DealDocument) {
  const dealDocumentService = useDealDocumentsService();
  const rrDataService = useRentRollDataService();
  const { documentData } = useDealDocumentData(deal?.id, document?.id);
  const data = documentData?.editedData as RRFExtractedData;
  const fpConfigQuery = dealDocumentService.useFPConfig(deal?.id, document?.id);
  const occupancyConfigQuery = dealDocumentService.useOccupancyConfig(deal?.id, document?.id);
  const chargeCodeConfigQuery = dealDocumentService.useChargeCodeConfig(deal?.id, document?.id);

  const bedsChartSummary: RRBedsUnitCountSummary = useMemo(() => {
    return rrDataService.getBedsChartSummary(data, fpConfigQuery.data);
  }, [data, rrDataService, fpConfigQuery.data]);
  const occupancyChartSummary = useMemo(() => {
    return rrDataService.getOccupancyChartSummary(data, occupancyConfigQuery.data);
  }, [data, occupancyConfigQuery.data, rrDataService]);
  const renovatedChartSummary = useMemo(() => {
    return rrDataService.getRenovatedChartSummary(data);
  }, [data, rrDataService]);
  const newLeaseChartSummary = useMemo(() => {
    return rrDataService.getNewLeasesChartSummary(data);
  }, [data, rrDataService]);
  const affordableChartSummary = useMemo(() => {
    return rrDataService.getAffordableChartSummary(data);
  }, [data, rrDataService]);
  const chargeCodeChartSummary = useMemo(() => {
    return rrDataService.getChargeCodeChartSummary(data, chargeCodeConfigQuery.data);
  }, [data, rrDataService, chargeCodeConfigQuery.data]);

  return {
    bedsChartSummary,
    occupancyChartSummary,
    renovatedChartSummary,
    newLeaseChartSummary,
    affordableChartSummary,
    chargeCodeChartSummary,
  };
}

export interface DocumentSummaryViewProps {
  deal: Deal;
  document: DealDocument;
}

export function DocumentAnalysisView({ deal, document }: DocumentSummaryViewProps) {
  const chartData = useRentRollChartsData(deal, document);

  return (
    <FlexCol bg="gray.100">
      <Flex h={500} flexShrink={0}>
        <ChartWrapper title="Beds">
          <BedsUnitsCountChart data={chartData.bedsChartSummary}/>
        </ChartWrapper>
        <ChartWrapper title="Occupancy">
          <OccupancyChart data={chartData.occupancyChartSummary}/>
        </ChartWrapper>
      </Flex>
      <Flex h={500} flexShrink={0}>
        <ChartWrapper title="Renovated Status">
          <RenovatedChart data={chartData.renovatedChartSummary}/>
        </ChartWrapper>
        <ChartWrapper title="Affordable Status">
          <AffordableChart data={chartData.affordableChartSummary}/>
        </ChartWrapper>
      </Flex>
      <Flex h={500} flexShrink={0}>
        <ChartWrapper title="Charge Codes">
          <ChargeCodeChart data={chartData.chargeCodeChartSummary}/>
        </ChartWrapper>
        <ChartWrapper title="New Leases/Month">
          <NewLeasesChart data={chartData.newLeaseChartSummary}/>
        </ChartWrapper>
      </Flex>
    </FlexCol>
  );
}
