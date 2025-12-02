import React from 'react';
import { ViewSummaryRow } from '../../../../../../services/document/CashFlowSummaryExportService';
import memoizeOne from 'memoize-one';
import { AgGridReact } from 'ag-grid-react';
import { ColDef } from 'ag-grid-community';
import { chakra } from '@chakra-ui/react';

import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-balham.css';
import { formatAmount } from '../../../../../../services/utils/utils';
import { CashFlowDataService } from '../../../../../../services/document/CashFlowDataService';


export type CashFlowSummaryData = Map<string, ViewSummaryRow>;

export interface DocumentSummaryViewProps {
  summaryData: CashFlowSummaryData;
}

export function DocumentSummaryView({ summaryData }: DocumentSummaryViewProps) {
  return (
    <CashFlowSummary summaryData={summaryData}/>
  );
}


export interface CashFlowSummaryProps {
  summaryData: CashFlowSummaryData;
}

export interface CashFlowSummaryState {
  rows: ViewSummaryRow[];
}

export class CashFlowSummary extends React.Component<CashFlowSummaryProps, CashFlowSummaryState> {
  state = {
    rows: [],
  };

  constructor(props) {
    super(props);
    this.buildColumnDefinitions = memoizeOne(this.buildColumnDefinitions.bind(this));
  }

  static getDerivedStateFromProps(nextProp: CashFlowSummaryProps) {
    return {
      rows: [...nextProp.summaryData.values()],
    };
  }

  buildColumnDefinitions(summaryData: CashFlowSummaryData): ColDef[] {
    const cfDataService = CashFlowDataService.getService();
    const columns: ColDef[] = [
      { field: 'category', resizable: true, initialWidth: 260, pinned: 'left' },
    ];

    const dataColumnsSet = cfDataService.getSummaryDataColumns(this.props.summaryData);

    const dataColumns = [...dataColumnsSet].sort();
    for (const dataColumnKey of dataColumns) {
      columns.push({
        field: dataColumnKey,
        headerName: cfDataService.getSummaryDataHeaderName(dataColumnKey),
        resizable: true,
        initialWidth: 220,
        type: 'numericColumn',
        valueFormatter: ({ value, data }: { value: string, data: ViewSummaryRow }) => {
          if (data.isData || data.isTotalHeader || data.isSubTotalHeader) {
            let val = Number(value);
            if (isNaN(val)) {
              val = 0;
            }
            return formatAmount(val);
          }
          return value;
        },
      });
    }

    return columns;
  }

  rowClass = ({ data }: { data: ViewSummaryRow }): string | string[] => {
    if (data.isDisplayHeader) {
      return ['cf-summary-row', 'cf-summary-header-row'];
    }

    return '';
  };
  rowStyle = ({ data }: { data: ViewSummaryRow }) => {
    const style = {
      background: undefined,
      color: undefined,
      fontWeight: undefined,
      fontSize: undefined,
    };

    if (data.isDisplayHeader) {
      style.background = '#145d97';
      style.color = 'white';
      style.fontWeight = 'bold';
    } else if (data.isSubTotalHeader) {
      style.fontWeight = 500;
      style.background = '#f0f0f0';
    } else if (data.isTotalHeader) {
      style.fontWeight = 700;
      style.background = '#d0d0d0';
    } else {

    }

    return style;
  };

  render() {
    const columns = this.buildColumnDefinitions(this.props.summaryData);
    return (
      <chakra.div className="ag-theme-balham" h="full" w="full" flexShrink={0} p={4}>
        <AgGridReact
          rowData={this.state.rows}
          columnDefs={columns}
          getRowStyle={this.rowStyle}
          getRowClass={this.rowClass}
        />
      </chakra.div>
    );
  }
}
