import React, { useMemo } from 'react';
import { Deal, DealDocument, CFExtractedData } from '../../../../../../../types';
import { FlexCol } from '../../../../../../../bootstrap/chakra/components/layouts/FlexCol';
import { Flex } from '@chakra-ui/react';
import { useDealDocumentData } from '../../../../../../hooks/deal/document/useDealDocumentData';
import { useCashFlowDataService } from '../../../../../../services/document/CashFlowDataService';
import { GPRChart } from './GPRChart';
import { OperatingExpensesChart } from './OperatingExpensesChart';
import { ChartWrapper } from '../../summary/ChartWrapper';


function useCashFlowChartsData(deal: Deal, document: DealDocument) {
  const cfDataService = useCashFlowDataService();
  const { documentData } = useDealDocumentData(deal?.id, document?.id);
  const data = documentData?.editedData as CFExtractedData;
  const gprChartData = useMemo(() => {
    return data ? cfDataService.getGPRChartSummary(data) : {};
  }, [cfDataService, data]);
  const operatingExpensesChartData = useMemo(() => {
    return data ? cfDataService.getOperatingExpensesSummary(data) : {};
  }, [cfDataService, data]);

  return {
    gprChartData,
    operatingExpensesChartData,
  };
}


export interface DocumentAnalysisViewProps {
  deal: Deal;
  document: DealDocument;
}

export function DocumentAnalysisView({ deal, document }: DocumentAnalysisViewProps) {
  const { gprChartData, operatingExpensesChartData } = useCashFlowChartsData(deal, document);

  return (
    <FlexCol bg="gray.100">
      <Flex h={550} flexShrink={0}>
        <ChartWrapper title="Gross Potential Rent">
          <GPRChart data={gprChartData}/>
        </ChartWrapper>
      </Flex>
      <Flex h={550} flexShrink={0}>
        <ChartWrapper title="Operating Expenses">
          <OperatingExpensesChart data={operatingExpensesChartData}/>
        </ChartWrapper>
      </Flex>
    </FlexCol>
  );
}
