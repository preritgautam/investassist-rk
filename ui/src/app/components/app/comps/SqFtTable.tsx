import { Deal, DealDocument } from '../../../../types';
import { CompSummary } from '../../../services/document/RentRollDataService';
import React from 'react';
import { ColDef } from 'ag-grid-community';
import { formatNumber } from '../../../services/utils/utils';
import { chakra } from '@chakra-ui/react';
import { AgGridReact } from 'ag-grid-react';
import { OccupancyType } from './RentrollComps';
import memoizeOne from 'memoize-one';
import { get } from 'radash';

interface SqFtTableProps {
  deals: Deal[];
  documents: DealDocument[];
  summaryData: CompSummary[];
  occupancy: OccupancyType;
}

interface CombinedSqFtSummary {
  _summaryKey: string;
  data: {
    [docId: string]: number;
    average: number;
  };
}

interface SqFtTableState {
  rows: CombinedSqFtSummary[];
}

export class SqFtTable extends React.Component<SqFtTableProps, SqFtTableState> {
  constructor(props) {
    super(props);
    this.buildColumnDefinitions = memoizeOne(this.buildColumnDefinitions.bind(this));
  }

  getTableData() {
    const columns = this.buildColumnDefinitions(this.props.deals, this.props.documents);
    const rows = this.state.rows;

    return {
      columns: columns.map((column: ColDef) => ({ name: column.headerName })),
      rows: rows.map((row: CombinedSqFtSummary) => {
        return columns.map((column: ColDef) => {
          const value: number | string = column.field ? get(row, column.field) : '';

          if (column.field === '_summaryKey') {
            return value === 'average' ? 'Average' : value;
          }

          let val = Number(value);
          if (isNaN(val)) {
            val = 0;
          }
          return formatNumber(val);
        });
      }),
    };
  }
  static getDerivedStateFromProps(nextProp: SqFtTableProps) {
    const { documents, summaryData, occupancy } = nextProp;
    const rowsMap: Record<string, CombinedSqFtSummary> = {};

    summaryData.forEach((summary: CompSummary, index: number) => {
      const document = documents[index];

      Reflect.ownKeys(summary.compsSummary).forEach((summaryKey: string) => {
        rowsMap[summaryKey] = rowsMap[summaryKey] ?? { _summaryKey: summaryKey, data: { average: 0 } };

        const area = occupancy === 'all' ?
          summary.compsSummary[summaryKey].totalSqFt :
          summary.compsSummary[summaryKey].totalOccupiedSqFt;

        rowsMap[summaryKey].data[document.id] = area;
      });
    });

    rowsMap['average'] = {
      _summaryKey: 'average',
      data: summaryData.reduce((obj, summary: CompSummary, index: number) => {
        const area = occupancy === 'all' ?
          summary.totalSqFt :
          summary.totalOccupiedSqFt;

        obj[documents[index].id] = area;
        return obj;
      }, { average: 0 }),
    };

    Reflect.ownKeys(rowsMap).forEach((summaryKey: string) => {
      let total = 0;
      let count = 0;
      Reflect.ownKeys(rowsMap[summaryKey].data).forEach((docId: string) => {
        if (docId !== 'average') {
          total += rowsMap[summaryKey].data[docId];
          count += 1;
        }
      });
      rowsMap[summaryKey].data['average'] = total / count;
    });

    return {
      rows: Reflect.ownKeys(rowsMap).map((key: string) => rowsMap[key])
        .sort((r1, r2) => r1._summaryKey < r2._summaryKey ? -1 : 1),
    };
  }

  buildColumnDefinitions(deals: Deal[], documents: DealDocument[]) {
    const columns: ColDef[] = [
      {
        field: '_summaryKey', resizable: true, initialWidth: 260, pinned: 'left', headerName: '',
        valueFormatter: ({ value }: { value: string }) => {
          return value === 'average' ? 'Average' : value;
        },
      },
    ];

    documents.forEach((document: DealDocument, index: number) => {
      columns.push({
        field: `data.${document.id}`,
        resizable: true,
        initialWidth: 200,
        headerName: deals[index].name,
        type: 'numericColumn',
        valueFormatter: ({ value, data }: { value: string, data: CombinedSqFtSummary }) => {
          let val = Number(value);
          if (isNaN(val)) {
            val = 0;
          }
          return formatNumber(val);
        },
      });
    });

    columns.push(
      {
        field: 'data.average',
        headerName: 'Average',
        resizable: true,
        initialWidth: 260,
        type: 'numericColumn',
        valueFormatter: ({ value, data }: { value: string, data: CombinedSqFtSummary }) => {
          let val = Number(value);
          if (isNaN(val)) {
            val = 0;
          }
          return formatNumber(val);
        },
      },
    );

    return columns;
  }

  rowStyle = ({ data }: { data: CombinedSqFtSummary }) => {
    const style = {
      background: undefined,
      color: undefined,
      fontWeight: undefined,
      fontSize: undefined,
    };

    if (data._summaryKey === 'average') {
      style.background = '#145d97';
      style.color = 'white';
      style.fontWeight = 'bold';
    }

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
