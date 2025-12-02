import { Deal, DealDocument, RRFDataFieldType, RRFExtractedData } from '../../../../../../types';
import { useDealDocumentData } from '../../../../../hooks/deal/document/useDealDocumentData';
import { FlexCol } from '../../../../../../bootstrap/chakra/components/layouts/FlexCol';
import { Divider, Tab, TabList, TabPanels, Tabs } from '@chakra-ui/react';
import { TabPanel2 } from '../../../../core/chakra/TabPanel2';
import { DocumentSummaryView } from '../rentroll/dashboard/DocumentSummaryView';
import { DocumentAnalysisView } from '../rentroll/dashboard/DocumentAnalysisView';
import { RentRollEditor } from '../rentroll/editor/RentRollEditor';
import { noopFunc } from '../../../../../../bootstrap/utils/noop';
import React, { useCallback } from 'react';
import { DocumentDashboardHeader } from './DocumentDashboardHeader';
import { useRentRollSummaryData } from '../../../../../hooks/deal/document/UseRentRollSummaryData';
import { useRentRollSummaryExportService } from '../../../../../services/document/RentRollSummaryExportService';
import { useDealDocumentsService } from '../../../../../services/account/user/DealDocumentsService';
import * as XlsxPopulate from 'xlsx-populate';
import { saveAs } from 'file-saver';
import { DocumentPreview } from '../../../filePreview/FilePreview';
import { useIsFreeAccount } from '../../../../../hooks/deal/useIsFreeAccount';


interface RentRollDashboardProps {
  deal: Deal;
  document: DealDocument;
  closeUrl: string;
}

export function RentRollDashboard({ deal, document, closeUrl }: RentRollDashboardProps) {
  const dealDocumentService = useDealDocumentsService();
  const { documentData } = useDealDocumentData(deal.id, document.id);
  const { summaries: summaryData } = useRentRollSummaryData(deal, document);
  const rrExportSummaryService = useRentRollSummaryExportService();
  const fpConfigQuery = dealDocumentService.useFPConfig(deal?.id, document?.id);
  const chargeCodeConfigQuery = dealDocumentService.useChargeCodeConfig(deal?.id, document?.id);

  const isFreeAccount = useIsFreeAccount();


  const handleExportXlsx = useCallback(async () => {
    const xlsxData: XlsxPopulate.Workbook = await rrExportSummaryService.getSummaryDataXlsx(
      deal, document, documentData, summaryData, fpConfigQuery.data, chargeCodeConfigQuery.data,
    );
    const data = await xlsxData.outputAsync();
    saveAs(data, `${deal.name} - ${document.name} - summary.xlsx`);
  }, [
    chargeCodeConfigQuery.data, deal, document, documentData, fpConfigQuery.data, rrExportSummaryService, summaryData,
  ]);


  return (
    <FlexCol w="full">
      <DocumentDashboardHeader
        deal={deal} document={document} closeUrl={closeUrl} onTriggerExportXlsx={handleExportXlsx}
      />
      <Divider mb={2}/>
      <Tabs display="flex" flexDirection="column" minH={0} overflow="auto" flexGrow={1}>
        <TabList>
          <Tab>Summaries</Tab>
          <Tab>Analysis</Tab>
          <Tab>Data</Tab>
          <Tab>Original Document</Tab>
        </TabList>
        <TabPanels display="flex" flexDirection="column" minH={0} overflow="auto" flexGrow={1}>
          <TabPanel2>
            <DocumentSummaryView summaryData={summaryData}/>
          </TabPanel2>
          <TabPanel2>
            <DocumentAnalysisView deal={deal} document={document}/>
          </TabPanel2>
          <TabPanel2 flexGrow={1}>
            {documentData && (
              <RentRollEditor
                deal={deal} document={document} documentData={documentData}
                data={documentData?.editedData as RRFExtractedData}
                onDataChange={noopFunc} extraData={{}} readonly={true}
                wrapperProps={{ flexGrow: 1 }} onSave={noopFunc}
                showColumns={'' as RRFDataFieldType} isFreeAccount={isFreeAccount}
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
