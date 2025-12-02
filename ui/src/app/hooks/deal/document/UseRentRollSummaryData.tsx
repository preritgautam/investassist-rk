import { Deal, DealDocument, RRFExtractedData } from '../../../../types';
import { useDealDocumentsService } from '../../../services/account/user/DealDocumentsService';
import { useRentRollDataService } from '../../../services/document/RentRollDataService';
import { useDealDocumentData } from './useDealDocumentData';
import { useMemo } from 'react';


export function useRentRollSummaryData(deal: Deal, document: DealDocument) {
  const dealDocumentService = useDealDocumentsService();
  const rrDataService = useRentRollDataService();
  const { documentData, isLoading } = useDealDocumentData(deal?.id, document?.id);
  const data = documentData?.editedData as RRFExtractedData;
  const fpConfigQuery = dealDocumentService.useFPConfig(deal?.id, document?.id);
  const occupancyConfigQuery = dealDocumentService.useOccupancyConfig(deal?.id, document?.id);
  const chargeCodeConfigQuery = dealDocumentService.useChargeCodeConfig(deal?.id, document?.id);


  const summaries = useMemo(
    () => rrDataService.getValidatedSummary(
      data, fpConfigQuery.data, occupancyConfigQuery.data, chargeCodeConfigQuery.data, document.asOnDate,
    ),
    [
      rrDataService, data, fpConfigQuery.data, occupancyConfigQuery.data, chargeCodeConfigQuery.data, document.asOnDate,
    ],
  );

  return { summaries, isLoading };
}
