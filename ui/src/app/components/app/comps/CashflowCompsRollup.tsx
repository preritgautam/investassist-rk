import { Deal, DealDocument } from '../../../../types';
import { CombinedSummaryRow } from './useCashflowsCompData';
import React from 'react';
import memoizeOne from 'memoize-one';
import { monthYearDateIso } from '../../../../bootstrap/utils/dateFormat';
import { ColDef, ValueGetterParams } from 'ag-grid-community';
import { formatAmount } from '../../../services/utils/utils';
import { chakra } from '@chakra-ui/react';
import { AgGridReact } from 'ag-grid-react';
import { get } from 'radash';
import { ViewSummaryRow } from '../../../services/document/CashFlowSummaryExportService';
import { AmountsType } from './RentrollComps';

interface CashflowCompsRollupProps {
  cashflows: Record<string, string>;
  deals: Deal[];
  documents: DealDocument[];
  summaryData: Map<string, CombinedSummaryRow>;
  compsOrRollUp: 'Comps' | 'Rollup';
  amountsType: AmountsType,
}

function prepareRows(deals: Deal[], documents: DealDocument[], summaryData: Map<string, CombinedSummaryRow>) {
  const textRows: CombinedSummaryRow[] = [
    {
      category: 'Period',
      isTextData: true,
      data: documents.reduce((obj, document: DealDocument) => {
        obj[document.id] = `${monthYearDateIso(document.periodFrom)} - ${monthYearDateIso(document.periodTo)}`;
        return obj;
      }, {}),
    },
    {
      category: 'Units',
      isTextData: true,
      data: deals.reduce((obj, deal: Deal, index) => {
        obj[documents[index].id] = deal.details.numUnits;
        return obj;
      }, {}),
    },
  ];

  return [...textRows, ...summaryData.values()];
}

export class CashflowCompsRollup extends React.Component<CashflowCompsRollupProps> {
  state = {
    rows: [],
  };

  constructor(props) {
    super(props);
    this.buildColumnDefinitions = memoizeOne(this.buildColumnDefinitions.bind(this));
  }

  prepareRows = memoizeOne(prepareRows);

  getTableData() {
    const columns = this.buildColumnDefinitions(
      this.props.deals, this.props.cashflows, this.props.compsOrRollUp, this.props.amountsType,
    );
    const rows = this.prepareRows(this.props.deals, this.props.documents, this.props.summaryData);

    return {
      columns: columns.map((column: ColDef) => ({ name: column.headerName })),
      rows: rows.map((row: CombinedSummaryRow) => {
        return columns.map((column: ColDef) => {
          const value: number | string = column.field ? get(row, column.field) : '';

          if (column.field === 'category') {
            return value;
          }

          if (row.isData || row.isTotalHeader || row.isSubTotalHeader) {
            let val = Number(value);
            if (isNaN(val)) {
              val = 0;
            }
            return formatAmount(val);
          }
          if (row.isDisplayHeader) {
            return '';
          }
          return value;
        });
      }),
    };
  }

  private valueFormatter({ value, data }: { value: string, data: CombinedSummaryRow }) {
    if (data.isData || data.isTotalHeader || data.isSubTotalHeader) {
      let val = Number(value);
      if (isNaN(val)) {
        val = 0;
      }
      return formatAmount(val);
    }
    if (data.isDisplayHeader) {
      return '';
    }
    return value;
  }

  private dealColumnValueGetter(
    isNumericData: boolean,
    value: number | string,
    amountsType: AmountsType,
    unitCount: number,
  ) {
    if (amountsType === '$/unit') {
      if (isNumericData) {
        let val = Number(value);
        if (isNaN(val)) {
          val = 0;
        }
        return val / unitCount;
      }
    }
    return value;
  }

  private aggregateColumnValueGetter(
    { data }: ValueGetterParams,
    compsOrRollUp: 'Comps' | 'Rollup',
    amountsType: AmountsType,
    unitsCounts: Record<string, number>,
  ) {
    if (amountsType === '$') {
      return compsOrRollUp === 'Comps' ? data.data.average : data.data.total;
    }
    if (!(data.isData || data.isTotalHeader || data.isSubTotalHeader)) {
      return compsOrRollUp === 'Comps' ? data.data.average : data.data.total;
    }

    // $/unit Amounts for rows with numerical data

    if (compsOrRollUp === 'Rollup') {
      let val = Number(data.data.total);
      const totalUnits = Reflect.ownKeys(unitsCounts).reduce((t, key: string) => t + unitsCounts[key], 0);
      if (isNaN(val)) {
        val = 0;
      }
      return val / totalUnits;
    }

    // Comps with $/unit and numerical rows
    const docTotalsPerUnit = Reflect.ownKeys(unitsCounts).reduce(
      (obj, docId: string) => {
        let docTotal = Number(data.data[docId]);
        if (isNaN(docTotal)) docTotal = 0;
        obj[docId] = docTotal / unitsCounts[docId];
        return obj;
      },
      {},
    );

    let avgOfAvg = Reflect.ownKeys(docTotalsPerUnit).reduce((t, docId) => t + docTotalsPerUnit[docId], 0);
    avgOfAvg = avgOfAvg / Reflect.ownKeys(docTotalsPerUnit).length;
    return avgOfAvg;
  }


  buildColumnDefinitions(
    deals: Deal[], cashflows: Record<string, string>, compsOrRollUp: 'Comps' | 'Rollup', amountsType: AmountsType,
  ) {
    const columns: ColDef[] = [
      { field: 'category', resizable: true, initialWidth: 260, pinned: 'left' },
    ];

    const unitCounts = deals.reduce((obj, deal) => {
      obj[cashflows[deal.id]] = deal.details.numUnits;
      return obj;
    }, {});

    for (const deal of deals) {
      columns.push({
        // field: `data.${cashflows[deal.id]}`,
        resizable: true,
        initialWidth: 200,
        headerName: deal.name,
        type: 'numericColumn',
        valueGetter: ({ data }: ValueGetterParams) => this.dealColumnValueGetter(
          data.isData || data.isTotalHeader || data.isSubTotalHeader,
          data.data[cashflows[deal.id]],
          amountsType,
          unitCounts[cashflows[deal.id]],
        ),
        valueFormatter: this.valueFormatter,
      });
    }

    columns.push(
      {
        field: compsOrRollUp === 'Comps' ? 'data.average' : 'data.total',
        headerName: compsOrRollUp === 'Comps' ? 'Average' : 'Total',
        resizable: true,
        initialWidth: 260,
        type: 'numericColumn',
        valueGetter: (params: ValueGetterParams) => this.aggregateColumnValueGetter(
          params, compsOrRollUp, amountsType, unitCounts,
        ),
        valueFormatter: this.valueFormatter,
      },
    );

    return columns;
  }

  rowClass = ({ data }: { data: ViewSummaryRow }): string | string[] => {
    if (data.isDisplayHeader) {
      return ['cf-summary-row', 'cf-summary-header-row'];
    }

    return '';
  };

  rowStyle = ({ data }: { data: CombinedSummaryRow }) => {
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
    const columns = this.buildColumnDefinitions(
      this.props.deals, this.props.cashflows, this.props.compsOrRollUp, this.props.amountsType,
    );
    const rows = this.prepareRows(this.props.deals, this.props.documents, this.props.summaryData);
    return (
      <chakra.div className="ag-theme-balham" h="full" w="full" flexShrink={0} py={4}>
        <AgGridReact
          rowData={rows}
          columnDefs={columns}
          getRowStyle={this.rowStyle}
          getRowClass={this.rowClass}
        />
      </chakra.div>
    );
  }
}
