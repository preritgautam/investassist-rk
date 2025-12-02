import { RRFColumn, RRFDataColumn, RRFDataRow, RRFStaticColumn } from '../../../../types';
import React from 'react';
import memoizeOne from 'memoize-one';
import { ColDef } from 'ag-grid-community';
import { IDCell } from '../deal/document/editor/IDCell';
import { noopFunc } from '../../../../bootstrap/utils/noop';
import { RentRollDataService } from '../../../services/document/RentRollDataService';
import { formatValue, getValue } from '../deal/document/rentroll/editor/utils';
import { RRUnitInformationField } from '../../../enums/RentRollFieldEnum';
import { chakra } from '@chakra-ui/react';
import { AgGridReact } from 'ag-grid-react';

export interface RentRollsRollUpTableProps {
  data: {
    rows: RRFDataRow[];
    columns: RRFColumn[];
  };
}

export interface RentRollsRollUpTableState {

}

export class RentRollsRollUpTable extends React.Component<RentRollsRollUpTableProps, RentRollsRollUpTableState> {
  constructor(props) {
    super(props);
    this.buildColumnDefinitions = memoizeOne(this.buildColumnDefinitions.bind(this));
  }

  buildColumnDefinitions(columns: RRFColumn[]) {
    const keyColumns: ColDef[] = [{
      colId: 'id',
      pinned: 'left',
      resizable: false,
      initialWidth: 50,
      suppressMenu: true,
      type: 'numericColumn',
      valueGetter: (params) => {
        return params.data.id;
      },
      cellRenderer: (props) => (
        <IDCell
          {...props} onDelete={noopFunc} onInsert={noopFunc} readonly
        />
      ),
      // cellStyle: this.cellStyle.bind(null, null),
    }];

    const dataColumns: ColDef[] = [];
    const chargeCodeColumns: ColDef[] = [];
    const rentRollDataService: RentRollDataService = RentRollDataService.getService();

    columns.forEach((column: RRFColumn) => {
      const dColumn: RRFDataColumn = column as RRFDataColumn;

      const colDef: Partial<ColDef> = {
        field: column.key,
        colId: column.key,
        headerName: dColumn.header ?? (column as RRFStaticColumn).label,
        resizable: true,
        suppressMenu: true,
        valueFormatter: (params) => formatValue(params, dColumn),
        valueGetter: (params) => getValue(params, dColumn),
        hide: dColumn.discard,
        pinned: dColumn.name === RRUnitInformationField.unit.key || dColumn.name === 'propName',
      };

      if (dColumn.type === 'chargeCode') {
        colDef.type = 'numericColumn';
      } else {
        const field = rentRollDataService.getRRColumnField(dColumn as RRFDataColumn);
        if (field) {
          if (['amount', 'amount_psf'].includes(field.options.type)) {
            colDef.type = 'numericColumn';
          } else if (field.options.type === 'number') {
            colDef.type = 'numericColumn';
          } else if (field.options.type === 'date') {
          } else if (field.options.type === 'bool') {
          } else if (field.options.type === 'enum') {
          }
        }
      }

      const dataOrCCColumn = {
        ...colDef,
        editable: false,
        initialWidth: 170,
      };

      if (dColumn.type === 'chargeCode') {
        chargeCodeColumns.push(dataOrCCColumn);
      } else {
        dataColumns.push(dataOrCCColumn);
      }
    });


    return [...keyColumns, ...dataColumns, ...chargeCodeColumns];
  }

  render() {
    const columns = this.buildColumnDefinitions(this.props.data.columns);

    return (
      <chakra.div className="ag-theme-balham" w="full" h="full" flexShrink={0} py={4}>
        <AgGridReact
          rowData={this.props.data.rows}
          columnDefs={columns}
          // getRowStyle={this.rowStyle}
        />
      </chakra.div>
    );
  }
}
