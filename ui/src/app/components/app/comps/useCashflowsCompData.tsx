import { useDealDocumentsService } from '../../../services/account/user/DealDocumentsService';
import {
  ColKeySeparator,
  useCashFlowSummaryExportService,
  ViewSummaryRow,
} from '../../../services/document/CashFlowSummaryExportService';
import { useMemo } from 'react';
import { CFExtractedData } from '../../../../types';
import { useAccountCOASummary } from '../../../context/AccountCoaSummaryContext';

export interface CombinedSummaryRow {
  category: string;
  isDisplayHeader?: boolean;
  isSubTotalHeader?: boolean;
  isTotalHeader?: boolean;
  isData?: boolean;
  isTextData?: boolean;
  data: { [key: string]: number };
}


function getCombinedSummary(viewSummary: Map<string, ViewSummaryRow>[], cashFlows: [string, string][]) {
  if (viewSummary === null) {
    return null;
  }

  const combined = new Map<string, CombinedSummaryRow>();
  viewSummary.forEach((docSummary, index) => {
    for (const category of docSummary.keys()) {
      const categoryData: ViewSummaryRow = docSummary.get(category);
      const totalValue = Reflect.ownKeys(categoryData)
        .filter((key: string) => key.includes(ColKeySeparator))
        .reduce((total, valueKey) => total + categoryData[valueKey], 0);

      if (combined.has(category)) {
        const currentData = combined.get(category);
        currentData.data[cashFlows[index][1]] = totalValue;
        combined.set(category, currentData);
      } else {
        const currentData: CombinedSummaryRow = {
          category,
          isData: categoryData.isData,
          isDisplayHeader: categoryData.isDisplayHeader,
          isSubTotalHeader: categoryData.isSubTotalHeader,
          isTotalHeader: categoryData.isTotalHeader,
          data: {
            [cashFlows[index][1]]: totalValue,
          },
        };
        combined.set(category, currentData);
      }
    }
  });

  for (const key of combined.keys()) {
    const rowObj = combined.get(key);
    if (rowObj.isData || rowObj.isTotalHeader || rowObj.isSubTotalHeader) {
      const total = Reflect.ownKeys(rowObj.data).reduce((t, docId: string) => t + rowObj.data[docId], 0);
      const average = total / Reflect.ownKeys(rowObj.data).length;
      rowObj.data.total = total;
      rowObj.data.average = average;
      rowObj.data.averageOfAverage = 0;
      rowObj.data.averageOfTotal = 0;
    }
    combined.set(key, rowObj);
  }

  return combined;
}


export function useCashflowsCompData(cashFlows: [string, string][]) {
  const docService = useDealDocumentsService();
  const cfSummaryService = useCashFlowSummaryExportService();
  const queries = docService.useMultipleDocumentData(cashFlows);
  const summaryItems = useAccountCOASummary();

  const allDataAvailable = queries.every((q) => !!q.data);

  const rawSummary = useMemo(() => {
    return allDataAvailable ? queries.map((q) => {
      return q.data ?
        cfSummaryService.getRawSummaryData(q.data?.editedData as CFExtractedData) :
        {};
    }) : null;
  }, [allDataAvailable, queries, cfSummaryService]);

  const viewSummary = useMemo(() => {
    return allDataAvailable && rawSummary ? rawSummary.map((rs) => {
      return cfSummaryService.getSummaryViewData(rs, summaryItems);
    }) : null;
  }, [cfSummaryService, rawSummary, allDataAvailable, summaryItems]);

  const combinedSummary = useMemo(() => getCombinedSummary(viewSummary, cashFlows), [cashFlows, viewSummary]);

  return combinedSummary;
}
