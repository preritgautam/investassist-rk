import React, { useCallback, useMemo } from 'react';
import * as XlsxPopulate from 'xlsx-populate';
import { CFExtractedData, Deal, DealDocument } from '../../../../../../types';
import { useDealDocumentData } from '../../../../../hooks/deal/document/useDealDocumentData';
import { FlexCol } from '../../../../../../bootstrap/chakra/components/layouts/FlexCol';
import { Divider, Tab, TabList, TabPanels, Tabs } from '@chakra-ui/react';
import { TabPanel2 } from '../../../../core/chakra/TabPanel2';
import { noopFunc } from '../../../../../../bootstrap/utils/noop';
import { DocumentAnalysisView } from '../cashFlow/dashboard/DocumentAnalysisView';
import { CashFlowEditorWrapper } from '../cashFlow/CashFlowEditor';
import { DocumentDashboardHeader } from './DocumentDashboardHeader';
import { useCashFlowSummaryExportService } from '../../../../../services/document/CashFlowSummaryExportService';
import { DocumentSummaryView } from '../cashFlow/dashboard/DocumentSummaryView';
import { useCashFlowSummaryXlsxService } from '../../../../../services/document/CashFlowSummaryXlsxService';
import { saveAs } from 'file-saver';
import { DocumentPreview } from '../../../filePreview/FilePreview';
import { useIsFreeAccount } from '../../../../../hooks/deal/useIsFreeAccount';
import { useAccountCOASummary } from '../../../../../context/AccountCoaSummaryContext';

export interface CashFlowDashboardProps {
  deal: Deal;
  document: DealDocument;
  closeUrl: string;
}

export function CashFlowDashboard({ deal, document, closeUrl }: CashFlowDashboardProps) {
  const { documentData } = useDealDocumentData(deal.id, document.id);
  const cfSummaryService = useCashFlowSummaryExportService();
  const cfExportSummaryXlsxService = useCashFlowSummaryXlsxService();
  const isFreeAccount = useIsFreeAccount();
  const summaryItems = useAccountCOASummary();
  const rawSummary = useMemo(() => {
    return documentData ?
      cfSummaryService.getRawSummaryData(documentData?.editedData as CFExtractedData) :
      {};
  }, [cfSummaryService, documentData]);

  const summaryViewData = useMemo(
    () => summaryItems.length ?
      cfSummaryService.getSummaryViewData(rawSummary, summaryItems) :
      new Map(),
    [cfSummaryService, rawSummary, summaryItems],
  );

  const handleExportXlsx = useCallback(async () => {
    const xlsxData: XlsxPopulate.Workbook = await cfExportSummaryXlsxService.getSummaryDataXlsx(
      deal, document, summaryViewData,
    );
    const data = await xlsxData.outputAsync();
    saveAs(data, `${deal.name} - ${document.name} - summary.xlsx`);
  }, [deal, document, summaryViewData, cfExportSummaryXlsxService]);

  return (
    <FlexCol w="full">
      <DocumentDashboardHeader
        closeUrl={closeUrl} deal={deal} document={document}
        onTriggerExportXlsx={handleExportXlsx}/>
      <Divider mb={2}/>
      <Tabs display="flex" flexDirection="column" minH={0} overflow="auto" flexGrow={1}>
        <TabList>
          <Tab>Summary</Tab>
          <Tab>Analysis</Tab>
          <Tab>Data</Tab>
          <Tab>Original Document</Tab>
        </TabList>
        <TabPanels display="flex" flexDirection="column" minH={0} overflow="auto" flexGrow={1}>
          <TabPanel2 h="full">
            <DocumentSummaryView summaryData={summaryViewData}/>
          </TabPanel2>
          <TabPanel2>
            <DocumentAnalysisView deal={deal} document={document}/>
          </TabPanel2>
          <TabPanel2 flexGrow={1}>
            {documentData && (
              <CashFlowEditorWrapper
                deal={deal} document={document} documentData={documentData}
                onDataChange={noopFunc} readonly={true} wrapperProps={{ flexGrow: 1 }} onSave={noopFunc}
                isFreeAccount={isFreeAccount} clearClassification={noopFunc}
              />
            )}
          </TabPanel2>
          <TabPanel2 h="full">
            <DocumentPreview
              documentId={document?.id} dealId={deal?.id} fileName={document?.name}
            />
          </TabPanel2>
        </TabPanels>
      </Tabs>
    </FlexCol>
  );
}
