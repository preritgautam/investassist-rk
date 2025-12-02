import { Deal, DocumentData, RRFColumn, RRFDataRow } from '../../../../types';
import { useDealDocumentsService } from '../../../services/account/user/DealDocumentsService';
import { isNotNull } from '../../../services/utils/utils';
import { useMemo } from 'react';

export function useRentRollRollupData(rentrolls: [string, string][], deals: Deal[]) {
  const docService = useDealDocumentsService();
  const queries = docService.useMultipleDocumentData(rentrolls);
  const documentsData = queries.map((q) => q.data);
  const allDataAvailable = documentsData.every(isNotNull);

  const mergedData = useMemo(() => {
    if (!allDataAvailable) {
      return null;
    }

    const mergedRows = [];
    const mergedColumnsMap: Record<string, RRFColumn> = {
      'propName': {
        key: 'col0', name: 'propName', type: 'unitInformation', header: 'Property Name',
        sourceColumnIndex: -1, discard: false,
      },
    };
    const columnMappings: Record<string, string>[] = [];

    let keyIndex = 1;

    documentsData.forEach((documentData: DocumentData, index: number) => {
      columnMappings[index] = {};
      const columns = documentData.editedData.columns as RRFColumn[];
      columns.forEach((column: RRFColumn) => {
        if (mergedColumnsMap[column.name] === undefined) {
          mergedColumnsMap[column.name] = {
            ...column,
            key: `col${keyIndex}`,
          };
          columnMappings[index][column.key] = `col${keyIndex}`;
          keyIndex += 1;
        } else {
          columnMappings[index][column.key] = mergedColumnsMap[column.name].key;
        }
      });
    });

    const mergedColumns = Reflect.ownKeys(mergedColumnsMap).map((colName: string) => mergedColumnsMap[colName]);

    let rowId = 1;
    documentsData.forEach((documentData: DocumentData, index: number) => {
      const rows = documentData.editedData.rows as RRFDataRow[];
      rows.forEach((row: RRFDataRow) => {
        const mergedRow: RRFDataRow = {
          id: rowId, col0: deals[index].name,
        };
        rowId += 1;
        Reflect.ownKeys(row).forEach((colKey: string) => {
          if (colKey !== 'id') {
            const targetKey = columnMappings[index][colKey];
            mergedRow[targetKey] = row[colKey];
          }
        });
        mergedRows.push(mergedRow);
      });
    });

    return { rows: mergedRows, columns: mergedColumns };
  }, [allDataAvailable, deals, documentsData]);

  return mergedData;
}
