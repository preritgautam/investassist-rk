import { Text } from '@chakra-ui/react';
import React from 'react';
import { ICellRendererParams } from 'ag-grid-community';
import { CFDataRowWithIndex } from '../cashFlow/CashFlowEditor';

interface IDCellParams extends ICellRendererParams {
  readonly: boolean;
  data: CFDataRowWithIndex;
}

export function IDCell({ value, data }: IDCellParams) {
  const isCFSummaryRow = data.__isSummary && data.hasOwnProperty('lineItem') && data.hasOwnProperty('matched');

  if (!isCFSummaryRow) {
    return (
      <Text px={2}>{value}</Text>
    );
  } else {
    return null;
  }
}
