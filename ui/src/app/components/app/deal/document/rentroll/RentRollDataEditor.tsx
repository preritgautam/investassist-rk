import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ChargeCodeConfig,
  Deal,
  DealDocument, OccupancyConfig, FPConfig,
  RRFExtractedData, RRFDataColumn, RRFDataFieldType,
} from '../../../../../../types';
import {
  Center,
  CircularProgress,
  Divider,
  Flex,
} from '@chakra-ui/react';
import { useDealDocumentData } from '../../../../../hooks/deal/document/useDealDocumentData';
import { RentRollEditor } from './editor/RentRollEditor';
import { useRentRollDataService } from '../../../../../services/document/RentRollDataService';
import {
  RentRollDiscrepanciesService,
} from '../../../../../services/document/RentRollDiscrepanciesService';
import { useToggle } from '../../../../../../bootstrap/hooks/utils/useToggle';
import { RentRollDetailedSummary } from './RentRollDetailedSummary';
import { DocumentPreview } from '../../../filePreview/FilePreview';
import { useDealDocumentsService } from '../../../../../services/account/user/DealDocumentsService';
import { useConfigureChargeCodeModal } from './ConfigureChargeCodesModal';
import { useConfigureOccupancyModal } from './ConfigureOccupancyModal';
import { useConfigureFpModal } from './ConfigureFPModal';
import { RRUnitInformationField } from '../../../../../enums/RentRollFieldEnum';
import { FlexColPage } from '../../../../../../bootstrap/chakra/components/layouts/Page';
import { useRoutingService } from '../../../../../services/RoutingService';
import { RentRollEditorHeader } from './RentRollEditorHeader';
import { fileNameWithoutExtension } from '../../../../../services/utils/utils';
import { useRaiseTicketModal } from '../ticket/RaiseTicketFormModal';
import { RentRollDiscrepancies } from './RentRollDiscrepancies';
import { useXlsxPopulateService } from '../../../../../services/xlsx/XlsxPopulateService';
import { saveAs } from 'file-saver';
import { useIsFreeAccount } from '../../../../../hooks/deal/useIsFreeAccount';
import { useMixPanelService } from '../../../../../services/MixPanelService';


function useIsChargeCodeConfigInvalid(chargeCodeConfig: ChargeCodeConfig): [boolean, string[]] {
  // This keeps the list memoized i.e. the array does not change unless the config object changes
  const [chargeCodeList, setChargeCodeList] = useState<string[]>(null);
  const allChargeCodesNotMapped = useMemo(() => {
    const ccList = Reflect.ownKeys(chargeCodeConfig ?? {}) as string[];
    setChargeCodeList(ccList);
    for (const chargeCode of ccList) {
      if (!chargeCodeConfig?.[chargeCode]) {
        return true;
      }
    }
    return false;
  }, [chargeCodeConfig]);

  return [allChargeCodesNotMapped, chargeCodeList];
}

function useIsOccupancyConfigInvalid(occupancyConfig: OccupancyConfig): [boolean, string[]] {
  // This keeps the list memoized i.e. the array does not change unless the config object changes
  const [occupancyList, setOccupancyList] = useState<string[]>(null);
  const allOccupancyNotMapped = useMemo<boolean>(() => {
    const occupancyValues = Reflect.ownKeys(occupancyConfig ?? {}) as string[];
    setOccupancyList(occupancyValues);
    for (const occupancy of occupancyValues) {
      if (!occupancyConfig?.[occupancy]) {
        return true;
      }
    }
    return false;
  }, [occupancyConfig]);
  return [allOccupancyNotMapped, occupancyList];
}


function useIsFPConfigInvalid(fpConfig: FPConfig): [boolean, string[]] {
  const [fpList, setFPList] = useState<string[]>(null);
  const allFPNotMapped = useMemo<boolean>(() => {
    const fpValues = Reflect.ownKeys(fpConfig ?? {}) as string[];
    setFPList(fpValues);
    for (const fp of fpValues) {
      if (fpConfig[fp]?.tenantType !== 'Commercial' &&
        !(fpConfig[fp]?.tenantType === 'Residential' && fpConfig[fp].beds === 'studio')) {
        if (!fpConfig[fp].beds || !fpConfig[fp].baths) {
          return true;
        }
      }
    }
    return false;
  }, [fpConfig]);
  return [allFPNotMapped, fpList];
}


function useDataColumn(documentData, column: string) {
  const data: RRFExtractedData = documentData?.editedData as RRFExtractedData;
  if (column === 'occupancy') {
    return data?.columns?.find(
      (col: RRFDataColumn) => col.name === RRUnitInformationField.status.key && !col.discard);
  } else if (column === 'floor_plan') {
    return data?.columns?.find(
      (col: RRFDataColumn) => col.name === RRUnitInformationField.floorPlan.key && !col.discard,
    ) ?? data?.columns?.find(
      (col: RRFDataColumn) => col.name === RRUnitInformationField.unitType.key && !col.discard,
    ) ?? data?.columns?.find(
      (col: RRFDataColumn) => col.name === RRUnitInformationField.sqFt.key && !col.discard,
    );
  }
}

function getRRDiscrepancies(data, chargeCodeConfig, occupancyConfig, asOnDate) {
  const RRDiscrepanciesService = RentRollDiscrepanciesService.getService();
  return RRDiscrepanciesService.findDiscrepancies(
    chargeCodeConfig, occupancyConfig, asOnDate, data);
}


export interface RentRollDataEditorProps {
  deal: Deal;
  document: DealDocument;
  closeUrl: string;
}

export function RentRollDataEditor({ deal, document, closeUrl }: RentRollDataEditorProps) {
  const documentService = useDealDocumentsService();
  const { documentData, saveDocumentData, isSaving, isLoading } = useDealDocumentData(deal.id, document.id);
  const dataEditorRef = useRef<RentRollEditor>();
  const [isUnsaved, setIsUnsaved] = useState(false);
  const [editedData, setEditedData] = useState<RRFExtractedData>(null);
  const [isSummaryExpanded, toggleSummary] = useToggle(false);
  const [documentView, toggleDocumentView] = useToggle(false);
  const rentRollDataService = useRentRollDataService();
  const xlsxPopulateService = useXlsxPopulateService();
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [rrDiscrepancies, setRRDiscrepancies] = useState({});
  const [isDiscrepanciesExpanded, toggleDiscrepancies] = useToggle(false);
  const [showColumns, setShowColumns] = useState<RRFDataFieldType>('' as RRFDataFieldType);

  const isFreeAccount = useIsFreeAccount();

  const mixPanelService = useMixPanelService();


  const validateMutation = documentService.useValidateDocumentMutation();
  const handleValidate = useCallback(async () => {
    await validateMutation.mutateAsync({ dealId: deal.id, documentId: document.id, validate: true });
    mixPanelService.trackDealDocumentValidatedEvent(document, deal);
  }, [deal, document, validateMutation, mixPanelService]);

  const handleDataUpdated = useCallback((x: RRFExtractedData) => {
    setEditedData(x);
    setIsUnsaved(!!editedData);
    setCanUndo(dataEditorRef.current?.undoManager.canUndo());
    setCanRedo(dataEditorRef.current?.undoManager.canRedo());
  }, [editedData]);

  const handleDownload = useCallback(async () => {
    const data = dataEditorRef.current.getData();
    const simpleJsonData = rentRollDataService.dataToSimpleJSON(data);
    const sheetsData = rentRollDataService.buildExportRRWorkbookData(data.columns, simpleJsonData);
    const fileName = `${deal.name} - ${fileNameWithoutExtension(document.name)}.xlsx`;
    const xlsxData = await xlsxPopulateService.getXlsxWorkbook(deal, document, { RR_WORKBOOK: 'Sheet 1' }, sheetsData);
    const workbook = await xlsxData.outputAsync();
    saveAs(workbook, fileName);
  }, [rentRollDataService, deal, document, xlsxPopulateService]);

  const {
    data: chargeCodeConfig,
    refetch: refetchChargeCodeConfig,
    isLoading: isChargeCodeConfigLoading,
  } = useDealDocumentsService().useChargeCodeConfig(deal.id, document.id);
  const [allChargeCodesNotMapped, chargeCodeList] = useIsChargeCodeConfigInvalid(chargeCodeConfig);
  const [chargeCodeModal, openChargeCodeModal] = useConfigureChargeCodeModal({
    dealId: deal.id, documentId: document.id,
  });

  const occupancyPresent = !!useDataColumn(documentData, 'occupancy');

  const {
    data: occupancyConfig,
    refetch: refetchOccupancyConfig,
    isLoading: isOccupancyConfigLoading,
  } = useDealDocumentsService().useOccupancyConfig(deal.id, document.id);
  const [allOccupancyNotMapped, occupancyList] = useIsOccupancyConfigInvalid(occupancyConfig);
  const [occupancyModal, openOccupancyModal] = useConfigureOccupancyModal({
    dealId: deal.id, documentId: document.id,
  });

  const floorPlanPresent = !!useDataColumn(documentData, 'floor_plan');
  const {
    data: fpConfig,
    refetch: refetchFPConfig,
  } = useDealDocumentsService().useFPConfig(deal.id, document.id);
  const [allFPNotMapped, fpList] = useIsFPConfigInvalid(fpConfig);
  const [fpModal, openFPModal] = useConfigureFpModal({
    dealId: deal.id, documentId: document.id,
  });


  useEffect(() => {
    if (!isLoading && !isChargeCodeConfigLoading && !isOccupancyConfigLoading) {
      setRRDiscrepancies(
        getRRDiscrepancies(dataEditorRef.current.getData(), chargeCodeConfig, occupancyConfig, document.asOnDate),
      );
    }
  }, [chargeCodeConfig, occupancyConfig, document.asOnDate, dataEditorRef, isLoading,
    isChargeCodeConfigLoading, isOccupancyConfigLoading]);


  const handleSave = useCallback(async () => {
    await saveDocumentData(dataEditorRef.current.getData());
    setIsUnsaved(false);
    setRRDiscrepancies(
      getRRDiscrepancies(dataEditorRef.current.getData(), chargeCodeConfig, occupancyConfig, document.asOnDate),
    );
    refetchChargeCodeConfig().catch(console.error);
    refetchOccupancyConfig().catch(console.error);
    refetchFPConfig().catch(console.error);
    dataEditorRef.current.setHighlightedRow(null);
  }, [saveDocumentData, dataEditorRef, refetchChargeCodeConfig, refetchOccupancyConfig, refetchFPConfig,
    document.asOnDate, chargeCodeConfig, occupancyConfig]);

  const routing = useRoutingService();
  const handleClose = useCallback(async () => {
    await routing.goto({ url: closeUrl });
  }, [closeUrl, routing]);

  const undo = useCallback(() => dataEditorRef.current.undo(), []);
  const redo = useCallback(() => dataEditorRef.current.redo(), []);

  const [raiseTicketModal, showRaiseTicketModal] = useRaiseTicketModal({ deal, document });

  const setAsOnDateMutation = documentService.useSetAsOnDateMutation();
  const handleAsOnDateChange = useCallback(async (asOnDate: string) => {
    await setAsOnDateMutation.mutateAsync({
      dealId: deal.id, documentId: document.id, asOnDate,
    });
  }, [deal.id, document.id, setAsOnDateMutation]);

  const highLightDiscrepancyRow = useCallback((rowIdx) => {
    dataEditorRef.current.setHighlightedRow(rowIdx);
  }, []);

  return (
    <FlexColPage>
      <RentRollEditorHeader
        documentName={document.name} onClose={handleClose}
        onSave={handleSave} isSaving={isSaving} isUnsaved={isUnsaved}
        onDownload={handleDownload}
        onToggleSummary={toggleSummary} summaryVisible={isSummaryExpanded}
        showDocumentView={documentView} onToggleDocumentView={toggleDocumentView}
        onConfigureChargeCodes={openChargeCodeModal} disableChargeCodes={!chargeCodeList?.length}
        allChargeCodesNotMapped={allChargeCodesNotMapped}
        onConfigureOccupancy={openOccupancyModal} disableOccupancy={!occupancyList?.length || !occupancyPresent}
        allOccupancyNotMapped={allOccupancyNotMapped}
        onConfigureFloorPlan={openFPModal} disableFloorPlan={!fpList?.length || !floorPlanPresent}
        allFPNotMapped={allFPNotMapped}
        canUndo={canUndo} onUndo={undo} canRedo={canRedo} onRedo={redo}
        onValidate={handleValidate} onRaiseTicket={showRaiseTicketModal}
        asOnDate={document.asOnDate} onAsOnDateChange={handleAsOnDateChange}
        onToggleDiscrepancies={toggleDiscrepancies} discrepanciesVisible={isDiscrepanciesExpanded}
        discrepanciesFound={Reflect.ownKeys(rrDiscrepancies).length > 0}
        highLightDiscrepancyRow={highLightDiscrepancyRow}
        showColumns={showColumns} onShowColumnsChange={setShowColumns}
      />
      {isLoading && (
        <Center h="full">
          <CircularProgress isIndeterminate/>
        </Center>
      )}
      {!isLoading && (
        <Flex flexGrow={1} w="full" overflow="auto">
          {documentData && (
            <Flex flexGrow={1} minH={0} overflow="auto">
              <Flex position="relative" flexGrow={1}>
                <RentRollEditor
                  deal={deal} document={document} documentData={documentData} data={editedData}
                  onDataChange={handleDataUpdated}
                  extraData={{
                    floorPlanConfig: fpConfig,
                    chargeCodeConfig: chargeCodeConfig,
                  }}
                  wrapperProps={{ w: 'full' }}
                  occupancyConfig={occupancyConfig}
                  ref={dataEditorRef}
                  onSave={handleSave}
                  showColumns={showColumns}
                  isFreeAccount={isFreeAccount}
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
                  <RentRollDetailedSummary
                    data={editedData} onToggleView={toggleSummary} w={80}
                    deal={deal} document={document}
                  />
                </>
              )}
              {isDiscrepanciesExpanded && (
                <>
                  <Divider orientation="vertical" mx={4}/>
                  <RentRollDiscrepancies
                    data={rrDiscrepancies} onToggleView={toggleDiscrepancies}
                    highlightRow={highLightDiscrepancyRow} w={80}
                  />
                </>
              )}
            </Flex>
          )}
          {chargeCodeModal}
          {occupancyModal}
          {fpModal}
          {raiseTicketModal}
        </Flex>
      )}
    </FlexColPage>
  );
}


