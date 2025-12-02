import { useRentRollDataService } from '../../../services/document/RentRollDataService';
import { useDealDocumentsService } from '../../../services/account/user/DealDocumentsService';
import { isNotNull } from '../../../services/utils/utils';
import { useMemo } from 'react';
import { BedsType } from './RentrollComps';

export function useRentRollsCompData(
  rentrolls: [string, string][], bedsType: BedsType,
) {
  const rrDataService = useRentRollDataService();
  const docService = useDealDocumentsService();
  const queries = docService.useMultipleDocumentData(rentrolls);
  const fpConfigQueries = docService.useMultipleFPConfig(rentrolls);
  const occupancyConfigQueries = docService.useMultipleOccupancyConfig(rentrolls);
  const chargeCodeConfigQueries = docService.useMultipleChargeCodeConfig(rentrolls);

  const documentsData = queries.map((q) => q.data);
  const fpConfigs = fpConfigQueries.map((q) => q.data);
  const occupancyConfigs = occupancyConfigQueries.map((q) => q.data);
  const chargeCodeConfigs = chargeCodeConfigQueries.map((q) => q.data);

  const allDataAvailable = documentsData.every(isNotNull) &&
    fpConfigs.every(isNotNull) &&
    occupancyConfigs.every(isNotNull) &&
    chargeCodeConfigs.every(isNotNull);

  const summaries = useMemo(() => {
    if (allDataAvailable) {
      return rrDataService.getRentRollComps(
        documentsData,
        { fpConfigs, occupancyConfigs, chargeCodeConfigs },
        { bedsType },
      );
    }

    return null;
  }, [allDataAvailable, bedsType, chargeCodeConfigs, documentsData, fpConfigs, occupancyConfigs, rrDataService]);

  return summaries;
}
