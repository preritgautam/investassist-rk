import { CFDataColumn, ExtractedData } from '../../../../../types';
import { useCashFlowDataService } from '../../../../services/document/CashFlowDataService';
import { useEffect, useMemo, useState } from 'react';
import { noopArray } from '../../../../../bootstrap/utils/noop';

export function useSummarizableColumns(
  data: ExtractedData,
): [CFDataColumn[], string, (key: string) => void] {
  const cashFlowDataService = useCashFlowDataService();

  const summarizableColumns = useMemo(
    () => data ? cashFlowDataService.getSummarizableColumns(data) : noopArray,
    [data, cashFlowDataService],
  );

  const lastColumn = summarizableColumns.slice(-1)[0];
  const [summaryColumn, setSummaryColumn] = useState(lastColumn?.key);


  useEffect(() => {
    if (summarizableColumns.length) {
      // if not (summaryColumn is set and present in summarizable columns)
      if (!(summaryColumn && summarizableColumns.some((c) => c.key === summaryColumn))) {
        setSummaryColumn(summarizableColumns[0].key);
      }
    }
  }, [summarizableColumns, summaryColumn]);

  return [summarizableColumns, summaryColumn, setSummaryColumn];
}
