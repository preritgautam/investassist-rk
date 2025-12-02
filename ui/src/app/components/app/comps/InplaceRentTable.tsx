import { Deal, DealDocument } from '../../../../types';
import { CompSummary } from '../../../services/document/RentRollDataService';
import React from 'react';
import { ColDef } from 'ag-grid-community';
import { formatAmount } from '../../../services/utils/utils';
import { chakra } from '@chakra-ui/react';
import { AgGridReact } from 'ag-grid-react';
import { AmountsType, OccupancyType, RentType } from './RentrollComps';
import { get } from 'radash';
import memoizeOne from 'memoize-one';

interface InplaceRentTableProps {
  deals: Deal[];
  documents: DealDocument[];
  summaryData: CompSummary[];
  amountsType: AmountsType;
  rentType: RentType;
  occupancy: OccupancyType;
}

interface CombinedInplaceRentSummary {
  _summaryKey: string;
  data: {
    [docId: string]: number;
    average: number;
  };
}

interface InplaceRentTableState {
  rows: CombinedInplaceRentSummary[];
}

export class InplaceRentTable extends React.Component<InplaceRentTableProps, InplaceRentTableState> {
  constructor(props) {
    super(props);
    this.buildColumnDefinitions = memoizeOne(this.buildColumnDefinitions.bind(this));
  }

  static getDerivedStateFromProps(nextProp: InplaceRentTableProps) {
    const { documents, rentType, amountsType, summaryData, occupancy } = nextProp;
    const rowsMap: Record<string, CombinedInplaceRentSummary> = {};

    summaryData.forEach((summary: CompSummary, index: number) => {
      const document = documents[index];

      Reflect.ownKeys(summary.compsSummary).forEach((summaryKey: string, index: number) => {
        rowsMap[summaryKey] = rowsMap[summaryKey] ?? { _summaryKey: summaryKey, data: { average: 0 } };

        let rent = rentType === 'netEffectiveRent' ?
          (
            occupancy === 'all' ?
              summary.compsSummary[summaryKey].totalNetEffectiveRent :
              summary.compsSummary[summaryKey].totalOccupiedNetEffectiveRent
          ) :
          (
            occupancy === 'all' ?
              summary.compsSummary[summaryKey].totalMonthlyRent :
              summary.compsSummary[summaryKey].totalOccupiedMonthlyRent
          );

        if (amountsType === '$/unit') {
          if (occupancy === 'all') {
            rent /= summary.compsSummary[summaryKey].count;
          } else {
            rent /= summary.compsSummary[summaryKey].occupiedCount;
          }
        } else if (amountsType === '$/sqft') {
          if (occupancy === 'all') {
            rent /= summary.compsSummary[summaryKey].totalSqFt;
          } else {
            rent /= summary.compsSummary[summaryKey].totalOccupiedSqFt;
          }
        }


        rowsMap[summaryKey].data[document.id] = rent;
      });
    });

    rowsMap['average'] = {
      _summaryKey: 'average',
      data: summaryData.reduce((obj, summary: CompSummary, index: number) => {
        let rent = rentType === 'netEffectiveRent' ?
          (
            occupancy === 'all' ?
              summary.totalNetEffectiveRent :
              summary.totalOccupiedNetEffectiveRent
          ) :
          (
            occupancy === 'all' ?
              summary.totalMonthlyRent :
              summary.totalOccupiedMonthlyRent
          );

        if (amountsType === '$/unit') {
          if (occupancy === 'all') {
            rent /= summary.totalUnitsCount;
          } else {
            rent /= summary.totalOccupiedUnits;
          }
        } else if (amountsType === '$/sqft') {
          if (occupancy === 'all') {
            rent /= summary.totalSqFt;
          } else {
            rent /= summary.totalOccupiedSqFt;
          }
        }

        obj[documents[index].id] = rent;
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

  getTableData() {
    const columns = this.buildColumnDefinitions(this.props.deals, this.props.documents);
    const rows = this.state.rows;

    return {
      columns: columns.map((column: ColDef) => ({ name: column.headerName })),
      rows: rows.map((row: CombinedInplaceRentSummary) => {
        return columns.map((column: ColDef) => {
          const value: number | string = column.field ? get(row, column.field) : '';

          if (column.field === '_summaryKey') {
            return value === 'average' ? 'Average' : value;
          }

          let val = Number(value);
          if (isNaN(val)) {
            val = 0;
          }
          return formatAmount(val);
        });
      }),
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
        valueFormatter: ({ value, data }: { value: string, data: CombinedInplaceRentSummary }) => {
          let val = Number(value);
          if (isNaN(val)) {
            val = 0;
          }
          return formatAmount(val);
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
        valueFormatter: ({ value, data }: { value: string, data: CombinedInplaceRentSummary }) => {
          let val = Number(value);
          if (isNaN(val)) {
            val = 0;
          }
          return formatAmount(val);
        },
      },
    );

    return columns;
  }

  rowStyle = ({ data }: { data: CombinedInplaceRentSummary }) => {
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
