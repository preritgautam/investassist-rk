import React, { useCallback, useEffect, useRef, useState } from 'react';
import { CFColumn, CFExtractedData, Deal, DealDocument, LineItemsDictionary } from '../../../../../../types';
import { Divider, Flex } from '@chakra-ui/react';
import { CashFlowEditor, CashFlowEditorWrapper } from './CashFlowEditor';
import { useDealDocumentData } from '../../../../../hooks/deal/document/useDealDocumentData';
import { CashFlowDetailedSummary } from './CashFlowDetailedSummary';
import { useToggle } from '../../../../../../bootstrap/hooks/utils/useToggle';
import { useCashFlowDataService } from '../../../../../services/document/CashFlowDataService';
import { DocumentPreview } from '../../../filePreview/FilePreview';
import { FlexColPage } from '../../../../../../bootstrap/chakra/components/layouts/Page';
import { useRoutingService } from '../../../../../services/RoutingService';
import { useDealDocumentsService } from '../../../../../services/account/user/DealDocumentsService';
import { CashFlowEditorHeader } from './CashFlowEditorHeader';
import { fileNameWithoutExtension } from '../../../../../services/utils/utils';
import { useCopyClassification } from './CopyClassificationPopup';
import { useDealService } from '../../../../../services/account/user/DealService';
import { useRaiseTicketModal } from '../ticket/RaiseTicketFormModal';
import { useXlsxPopulateService } from '../../../../../services/xlsx/XlsxPopulateService';
import { saveAs } from 'file-saver';
import { CashFlowDiscrepanciesService } from '../../../../../services/document/CashFlowDiscrepanciesService';
import { CashFlowDiscrepancies } from './CFDiscrepancies';
import { useIsFreeAccount } from '../../../../../hooks/deal/useIsFreeAccount';
import { useMixPanelService } from '../../../../../services/MixPanelService';


function getCFDiscrepancies(data) {
  const cfDiscrepanciesService = CashFlowDiscrepanciesService.getService();
  return cfDiscrepanciesService.findDiscrepancies(data);
}


export interface CashFlowDataEditorProps {
  deal: Deal;
  document: DealDocument;
  closeUrl: string;
}

export function CashFlowDataEditor({ deal, document, closeUrl }: CashFlowDataEditorProps) {
  const { documentData, saveDocumentData, isSaving, isLoading } = useDealDocumentData(deal.id, document.id);
  const documentService = useDealDocumentsService();
  const dealService = useDealService();
  const dataEditorRef = useRef<CashFlowEditor>();
  const [editedData, setEditedData] = useState<CFExtractedData>(null);
  const [isSummaryExpanded, toggleSummary] = useToggle(false);
  const cashFlowDataService = useCashFlowDataService();
  const xlsxPopulateService = useXlsxPopulateService();
  const [documentView, toggleDocumentView] = useToggle(false);
  const [isUnsaved, setIsUnsaved] = useState(false);

  const isFreeAccount = useIsFreeAccount();

  const mixPanelService = useMixPanelService();

  const [cfDiscrepancies, setCFDiscrepancies] = useState({});
  const [isDiscrepanciesExpanded, toggleDiscrepancies] = useToggle(false);

  const handleReverseRowSign = useCallback(() => {
    dataEditorRef.current.reverseSelectedRowSign();
  }, []);

  const handleDataUpdated = useCallback((x: CFExtractedData) => {
    setEditedData(x);
    setIsUnsaved(!!editedData);
    setCanUndo(dataEditorRef.current?.undoManager.canUndo());
    setCanRedo(dataEditorRef.current?.undoManager.canRedo());
  }, [editedData]);


  useEffect(() => {
    if (!isLoading) {
      setCFDiscrepancies(
        getCFDiscrepancies(dataEditorRef.current.getData()),
      );
    }
  }, [dataEditorRef, isLoading]);

  const handleSave = useCallback(async () => {
    await saveDocumentData(dataEditorRef.current.getData());
    setIsUnsaved(false);
    setCFDiscrepancies(
      getCFDiscrepancies(dataEditorRef.current.getData()),
    );
  }, [saveDocumentData, dataEditorRef]);

  const handleDownload = useCallback(async () => {
    const data = dataEditorRef.current.getData();
    const simpleJsonData = cashFlowDataService.dataToSimpleJSON(data);
    const sheetsData = cashFlowDataService.buildExportCFWorkbookData(data.columns as CFColumn[], simpleJsonData);
    const fileName = `${deal.name} - ${fileNameWithoutExtension(document.name)}.xlsx`;
    const xlsxData = await xlsxPopulateService.getXlsxWorkbook(deal, document, { CF_WORKBOOK: 'Sheet 1' }, sheetsData);
    const workbook = await xlsxData.outputAsync();
    saveAs(workbook, fileName);
  }, [cashFlowDataService, deal, document, xlsxPopulateService]);

  const routing = useRoutingService();
  const handleClose = useCallback(async () => {
    await routing.goto({ url: closeUrl });
  }, [closeUrl, routing]);

  const handleCopyClassification = useCallback(async (sourceDealId: string) => {
    const dictionary: LineItemsDictionary = await dealService.getDealDictionary(sourceDealId);
    dataEditorRef.current.applyLineItemsClassificationDictionary(dictionary);
  }, [dealService]);

  const [copyClassificationPopup, showCopyClassificationPopup] = useCopyClassification(deal, handleCopyClassification);

  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const undo = useCallback(() => dataEditorRef.current.undo(), []);
  const redo = useCallback(() => dataEditorRef.current.redo(), []);


  const [raiseTicketModal, showRaiseTicketModal] = useRaiseTicketModal({ deal, document });

  const validateMutation = documentService.useValidateDocumentMutation();
  const handleValidate = useCallback(async () => {
    await validateMutation.mutateAsync({ dealId: deal.id, documentId: document.id, validate: true });
    mixPanelService.trackDealDocumentValidatedEvent(document, deal);
  }, [deal, document, validateMutation, mixPanelService]);

  const [anyRowSelected, setAnyRowSelected] = useState(false);
  const handleRowSelectionChanged = useCallback((rowIds: number[]) => {
    setAnyRowSelected(rowIds.length > 0);
  }, []);

  const highLightDiscrepancyRow = useCallback((rowIndex) => {
    dataEditorRef.current.setHighlightedRow(rowIndex);
  }, []);

  const clearClassification = useCallback(()=>{
    dataEditorRef.current.removeClassification();
  }, []);

  return (
    <FlexColPage>
      <CashFlowEditorHeader
        documentName={document.name} onClose={handleClose} onReverseRowSign={handleReverseRowSign}
        onSave={handleSave} isSaving={isSaving}
        summaryVisible={isSummaryExpanded} onToggleSummary={toggleSummary}
        onDownload={handleDownload} showDocumentView={documentView} onToggleDocumentView={toggleDocumentView}
        onCopyClassification={showCopyClassificationPopup} isUnsaved={isUnsaved}
        canUndo={canUndo} onUndo={undo} canRedo={canRedo} onRedo={redo}
        onValidate={handleValidate} rowsAreSelected={anyRowSelected} onRaiseTicket={showRaiseTicketModal}
        onToggleDiscrepancies={toggleDiscrepancies} discrepanciesVisible={isDiscrepanciesExpanded}
        discrepanciesFound={Reflect.ownKeys(cfDiscrepancies).length > 0}
        highLightDiscrepancyRow={highLightDiscrepancyRow}
      />
      <Flex minH={0} w="full" overflow="auto" flexGrow={1}>
        {documentData && (
          <Flex flexGrow={1} minH={0} overflow="auto">
            <Flex position="relative" flexGrow={1}>
              <CashFlowEditorWrapper
                key={document.id}
                deal={deal} document={document} documentData={documentData} ref={dataEditorRef}
                onDataChange={handleDataUpdated} wrapperProps={{ flexGrow: 1 }}
                onRowSelectionChanged={handleRowSelectionChanged} onSave={handleSave}
                isFreeAccount={isFreeAccount} clearClassification={clearClassification}
              />
              <Flex
                position="absolute" left={0} top={0} right={documentView ? 0 : '100%'}
                bottom={documentView ? 0 : '100%'} zIndex={2}
              >
                <DocumentPreview
                  documentId={document?.id} dealId={deal?.id} fileName={document?.name}
                  deferLoad={!documentView}
                />
              </Flex>
            </Flex>
            {isSummaryExpanded && (
              <>
                <Divider orientation="vertical" mx={4}/>
                <CashFlowDetailedSummary data={editedData} onToggleView={toggleSummary} w={80}/>
              </>
            )}
            {isDiscrepanciesExpanded && (
              <>
                <Divider orientation="vertical" mx={4}/>
                <CashFlowDiscrepancies data={cfDiscrepancies} onToggleView={toggleDiscrepancies}
                  highlightRow={highLightDiscrepancyRow} w={120}/>
              </>

            )}
          </Flex>
        )}
      </Flex>
      {copyClassificationPopup}
      {raiseTicketModal}
    </FlexColPage>
  );
}
