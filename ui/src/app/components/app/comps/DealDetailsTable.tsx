import { Deal, DealDocument } from '../../../../types';
import React from 'react';
import { ColDef } from 'ag-grid-community';
import { formatNumber, getMonthYear, parseNumeric } from '../../../services/utils/utils';
import { chakra } from '@chakra-ui/react';
import { AgGridReact } from 'ag-grid-react';
import { CompSummary } from '../../../services/document/RentRollDataService';
import { OccupancyType } from './RentrollComps';
import memoizeOne from 'memoize-one';
import { get } from 'radash';

interface DealDetailsTableProps {
  deals: Deal[];
  documents: DealDocument[];
  summaryData: CompSummary[];
  occupancy: OccupancyType;
}

interface CombinedDealDetailsSummary {
  _summaryKey: string;
  data: {
    [docId: string]: string | number;
  };
}

interface DealDetailsTableState {
  rows: CombinedDealDetailsSummary[];
}

export class DealDetailsTable extends React.Component<DealDetailsTableProps, DealDetailsTableState> {
  constructor(props) {
    super(props);
    this.buildColumnDefinitions = memoizeOne(this.buildColumnDefinitions.bind(this));
  }

  static getDerivedStateFromProps(nextProp: DealDetailsTableProps) {
    const { deals, documents, summaryData, occupancy } = nextProp;
    const rowsMap: Record<string, CombinedDealDetailsSummary> = {
      'As On Date': { _summaryKey: 'As On Date', data: {} },
      'Total Units': { _summaryKey: 'Total Units', data: {} },
    };

    deals.forEach((deal: Deal, index: number) => {
      const document = documents[index];
      rowsMap['As On Date'].data[document.id] = getMonthYear(document.asOnDate);
      rowsMap['Total Units'].data[document.id] = deal.details.numUnits;
    });

    const rowsMap2: Record<string, CombinedDealDetailsSummary> = {};

    summaryData.forEach((summary: CompSummary, index: number) => {
      const document = documents[index];

      Reflect.ownKeys(summary.compsSummary).forEach((summaryKey: string) => {
        rowsMap2[summaryKey] = rowsMap2[summaryKey] ?? { _summaryKey: summaryKey, data: { average: 0 } };

        const count = occupancy === 'all' ?
          summary.compsSummary[summaryKey].count :
          summary.compsSummary[summaryKey].occupiedCount;

        rowsMap2[summaryKey].data[document.id] = count;
      });
    });

    return {
      rows: [
        ...Reflect.ownKeys(rowsMap).map((key: string) => rowsMap[key]),
        ...Reflect.ownKeys(rowsMap2).map((key: string) => rowsMap2[key])
          .sort((r1, r2) => r1._summaryKey < r2._summaryKey ? -1 : 1),
      ],
    };
  }

  buildColumnDefinitions(deals: Deal[], documents: DealDocument[]) {
    const columns: ColDef[] = [
      {
        field: '_summaryKey', resizable: true, initialWidth: 260, pinned: 'left', headerName: '',
      },
    ];

    documents.forEach((document: DealDocument, index: number) => {
      columns.push({
        field: `data.${document.id}`,
        resizable: true,
        initialWidth: 200,
        headerName: deals[index].name,
        type: 'numericColumn',
        valueFormatter: ({ value, data }: { value: string, data: CombinedDealDetailsSummary }) => {
          if (typeof value === 'string') {
            return value;
          }
          return formatNumber(parseNumeric(value));
        },
      });
    });

    columns.push(
      {
        field: '',
        headerName: '',
        resizable: true,
        initialWidth: 260,
        type: 'numericColumn',
      },
    );

    return columns;
  }

  getTableData() {
    const columns = this.buildColumnDefinitions(this.props.deals, this.props.documents);
    const rows = this.state.rows;

    return {
      columns: columns.map((column: ColDef) => ({ name: column.headerName })),
      rows: rows.map((row: CombinedDealDetailsSummary) => {
        return columns.map((column: ColDef) => {
          const value: number | string = column.field ? get(row, column.field) : '';
          if (typeof value === 'string') {
            return value;
          }
          return formatNumber(parseNumeric(value));
        });
      }),
    };
  }

  rowStyle = ({ data }: { data: CombinedDealDetailsSummary }) => {
    const style = {
      background: undefined,
      color: undefined,
      fontWeight: undefined,
      fontSize: undefined,
    };
    return style;
  };

  render() {
    const columns = this.buildColumnDefinitions(
      this.props.deals, this.props.documents,
    );

    const height = 32 + ((this.state.rows.length + 1) * 28) + 7;

    return (
      <chakra.div className="ag-theme-balham" w="full" h={`${height}px`} flexShrink={0} py={4}>
        <AgGridReact
          rowData={this.state.rows}
          columnDefs={columns}
          getRowStyle={this.rowStyle}
        />
      </chakra.div>
    );
  }
}
