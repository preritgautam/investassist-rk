import React, { ForwardedRef, forwardRef } from 'react';
import {
  CFColumn,
  CFDataColumn,
  CFDataRow,
  CFExtractedData,
  CFStaticColumn,
  Deal,
  DealDocument,
  DocumentData,
  DocumentDataEditor, LineItemsDictionary,
} from '../../../../../../types';
import { chakra, FlexProps } from '@chakra-ui/react';
import { DateTime } from 'luxon';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-enterprise';
import {
  CellClassParams, CellStyle, ColDef, EditableCallbackParams, GridApi, IRowNode,
  RowNode, ValueGetterParams, ValueSetterParams, CellEditingStartedEvent, CellEditingStoppedEvent,
  CellKeyDownEvent, GetMainMenuItemsParams, MenuItemDef, GetContextMenuItemsParams,
} from 'ag-grid-community';
import memoizeOne from 'memoize-one';

import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-balham.css';
import { CashFlowDataService } from '../../../../../services/document/CashFlowDataService';
import { IDCell } from '../editor/IDCell';
import { CFDataColumnHeader } from './CFDataColumnHeader';
import { UndoManager } from '../../../../../services/utils/UndoManager';
import { CellValueChangedEvent } from 'ag-grid-community/dist/lib/events';
import { AGHeadCategoryPicker } from './AGHeadCategoryPicker';
import { CFStaticColumnHeader } from './CFStaticColumnHeader';
import { useAccountCOA } from '../../../../../context/AccountCoaContext';

const TextFilterParams = {
  suppressMenu: false,
  filter: 'agTextColumnFilter',
  filterParams: {
    buttons: ['apply', 'reset', 'cancel'],
    closeOnApply: true,
  },
};

const NumberFilterParams = {
  suppressMenu: false,
  filter: 'agNumberColumnFilter',
  filterParams: {
    buttons: ['apply', 'reset', 'cancel'],
    closeOnApply: true,
  },
};

function getRowId(params) {
  return params.data.id;
}

export interface CashFlowEditorProps {
  deal: Deal;
  document: DealDocument;
  documentData: DocumentData;
  onDataChange: (data: CFExtractedData) => void;
  readonly?: boolean;
  wrapperProps?: FlexProps;
  onRowSelectionChanged?: (rowIndexes: number[]) => void;
  onSave: () => void;
  isFreeAccount: boolean;
  clearClassification: () => void;
  coa: Record<string, string[]>;
}

export type CFDataRowWithIndex = CFDataRow & { __rowIndex: number };

interface CashFlowEditorState {
  colData: CFColumn[],
  summaryRows: CFDataRow[],
  rowData: CFDataRowWithIndex[],
}

function copyData<T extends object>(data: T[]): T[] {
  return data.map((r) => ({ ...r }));
}

function addRowIndex(rowData: CFDataRow[]): CFDataRowWithIndex[] {
  return rowData.map((r, i) => ({ ...r, __rowIndex: i }));
}

const statusBar = {
  statusPanels: [
    {
      statusPanel: 'agAggregationComponent',
      statusPanelParams: {
        // possible values are: 'count', 'sum', 'min', 'max', 'avg'
        aggFuncs: ['sum', 'avg', 'count'],
      },
    },
  ],
};

export class CashFlowEditor
  extends React.Component<CashFlowEditorProps, CashFlowEditorState>
  implements DocumentDataEditor {
  private gridRef = React.createRef<AgGridReact>();
  public readonly undoManager = new UndoManager<CashFlowEditorState>();
  private selectedNodes: IRowNode[] = [];
  private selectedNodesSet: Set<IRowNode> = new Set([]);
  private highlightedRowIndex: number = null;

  constructor(props: CashFlowEditorProps) {
    // noinspection DuplicatedCode
    super(props);
    const data: CFExtractedData = (props.documentData.editedData?.columns ?
      props.documentData.editedData :
      props.documentData.extractedData) as CFExtractedData;

    this.state = {
      colData: copyData<CFColumn>(data.columns),
      rowData: addRowIndex(copyData<CFDataRow>(data.rows)),
      summaryRows: [],
    };

    this.buildColumnDefinitions = memoizeOne(this.buildColumnDefinitions.bind(this));
  }

  getData() {
    return {
      columns: this.state.colData,
      rows: this.state.rowData,
    };
  }

  setHighlightedRow(row) {
    this.highlightedRowIndex = row;
    this.gridRef.current.api.refreshCells({ force: true });
    this.gridRef.current.api.ensureIndexVisible(row, 'middle');
  }


  removeClassification() {
    const updatedRows = this.state.rowData.map((row) => {
      return { ...row, head: '', category: '' };
    });
    this.setState({
      rowData: addRowIndex(updatedRows),
    }, () => {
      this.gridRef.current.api.refreshCells({ force: true });
      this.triggerDataChangeEvent().catch(console.error);
    });
  }

  componentDidMount() {
    this.triggerDataChangeEvent().catch(console.error);
  }

  reverseSelectedRowSign() {
    const selectedNodes = this.gridRef.current.api.getSelectedNodes();
    let updatedRowsData = this.state.rowData;

    selectedNodes.forEach((selectedNode) => {
      const selectedRowData: CFDataRowWithIndex = selectedNode.data;
      const __rowIndex = selectedRowData.__rowIndex;

      const updatedRowData = Reflect.ownKeys(selectedRowData).reduce((updatedRowData: CFDataRow, colKey: string) => {
        if (!colKey.startsWith('col')) {
          updatedRowData[colKey] = selectedRowData[colKey];
        } else {
          const value = parseFloat(selectedRowData[colKey]);
          if (isNaN(value)) {
            updatedRowData[colKey] = selectedRowData[colKey];
          } else if (value !== 0) {
            updatedRowData[colKey] = value * -1;
          } else {
            updatedRowData[colKey] = 0;
          }
        }
        return updatedRowData;
      }, {} as CFDataRow);

      updatedRowsData = [
        ...updatedRowsData.slice(0, __rowIndex),
        { ...updatedRowData, __rowIndex: selectedRowData.__rowIndex },
        ...updatedRowsData.slice(__rowIndex + 1),
      ];
    });

    this.setState({
      rowData: addRowIndex(updatedRowsData),
    }, () => {
      this.triggerDataChangeEvent().catch(console.error);
    });
  }

  applyLineItemsClassificationDictionary(dictionary: LineItemsDictionary) {
    const rowData: CFDataRow[] = [];
    this.state.rowData.forEach((row: CFDataRow) => {
      const classification = dictionary[`${row.lineItem}_|_${row.extractCat}`] ?? dictionary[row.lineItem];
      rowData.push({
        ...row,
        head: classification?.head ?? row.head,
        category: classification?.category ?? row.category,
      });
    });

    this.setState({
      rowData: addRowIndex(rowData),
    }, () => {
      this.gridRef.current.api.refreshCells({ force: true });
      this.triggerDataChangeEvent().catch(console.error);
    });
  }

  handleRowDelete = (__rowIndex: number) => {
    const selectedNodes = this.gridRef.current.api.getSelectedNodes();
    let rowData: CFDataRow[];
    // No selection, delete the given row
    if (selectedNodes.length === 0) {
      rowData = [...this.state.rowData.slice(0, __rowIndex), ...this.state.rowData.slice(__rowIndex + 1)];
    } else {
      const selectedRowIndex = selectedNodes.map((node) => node.data.__rowIndex);
      if (selectedRowIndex.includes(__rowIndex)) {
        // If the row index requesting delete is part of selection, delete all selected rows
        rowData = [];
        this.state.rowData.forEach((row, index) => {
          if (!selectedRowIndex.includes(index)) {
            rowData.push(row);
          }
        });
      } else {
        // Just delete the row requesting delete
        rowData = [...this.state.rowData.slice(0, __rowIndex), ...this.state.rowData.slice(__rowIndex + 1)];
      }
    }

    this.setState({
      rowData: addRowIndex(rowData),
    }, () => {
      this.gridRef.current.api.refreshCells({ columns: ['id'] });
      this.triggerDataChangeEvent().catch(console.error);
    });
  };

  handleRowInsert = (__rowIndex: number, before: boolean = true) => {
    const selectedNodes = this.gridRef.current.api.getSelectedNodes();
    let rowData: CFDataRow[];

    function emptyRow(): CFDataRow {
      return {
        id: Math.floor(Math.random() * 100000) + 100000,
        head: '',
        category: '',
        lineItem: '',
      };
    }

    const insertOneAt = (__rowIndex) => {
      if (before) {
        return [...this.state.rowData.slice(0, __rowIndex), emptyRow(), ...this.state.rowData.slice(__rowIndex)];
      } else {
        return [
          ...this.state.rowData.slice(0, __rowIndex + 1),
          emptyRow(),
          ...this.state.rowData.slice(__rowIndex + 1),
        ];
      }
    };

    if (selectedNodes.length === 0) {
      // No selection, insert before/after rowIndex
      rowData = insertOneAt(__rowIndex);
    } else {
      const selectedRowIndex = selectedNodes.map((node) => node.data.__rowIndex);
      if (selectedRowIndex.includes(__rowIndex) && selectedRowIndex.length > 1) {
        if (selectedRowIndex[0] + selectedRowIndex.length - 1 === selectedRowIndex[selectedRowIndex.length - 1]) {
          // If a contiguous block is selected, insert multiple
          const emptyRows = new Array(selectedRowIndex.length).fill(0).map(emptyRow);
          const insertAt = before ? selectedRowIndex[0] : selectedRowIndex[selectedRowIndex.length - 1];
          if (before) {
            rowData = [...this.state.rowData.slice(0, insertAt), ...emptyRows, ...this.state.rowData.slice(insertAt)];
          } else {
            rowData = [
              ...this.state.rowData.slice(0, insertAt + 1), ...emptyRows, ...this.state.rowData.slice(insertAt + 1),
            ];
          }
        } else {
          // just insert one at rowIndex
          rowData = insertOneAt(__rowIndex);
        }
      } else {
        // rowIndex is out of selection, or just one row selected just insert one empty row at rowIndex
        rowData = insertOneAt(__rowIndex);
      }
    }

    this.setState({
      rowData: addRowIndex(rowData),
    }, () => {
      this.gridRef.current.api.refreshCells({ columns: ['id'] });
      return this.triggerDataChangeEvent();
    });
  };

  cellStyle = (column: CFColumn, params: CellClassParams) => {
    const isSelected = this.gridRef.current.api.getSelectedNodes().includes(params.node);

    if (params.colDef.colId === 'id') {
      return {
        border: 'none',
        borderRight: isSelected ? '1px solid #777' : '1px solid #ccc',
        borderColor: '#ccc',
        background: isSelected ? '#bbb' : '#ddd',
        padding: 0,
        color: '#333',
      };
    }

    const style: CellStyle = {
      border: undefined,
      borderRight: undefined,
      borderColor: undefined,
      background: undefined,
      fontWeight: 'normal',
      color: undefined,
    };

    if (!params.data.__isSummary) {
      /* Data row cells styling */
      /* Line Item cell style */
      if (!(params.data.head && params.data.category)) {
        style.fontWeight = 'bold';
      }

      /* Head based background color */
      if (params.data.head === 'Income') {
        style.background = 'rgba(240,248,252, 1)';
      } else if (params.data.head === 'Expense') {
        style.background = 'rgba(255,248,248, 1)';
      } else if (params.data.head === 'Capital Expense') {
        style.background = 'rgba(255, 255, 240, 1)';
      } else if (params.data.head === 'NOI') {
        style.background = 'rgba(240,255,230, 1)';
      } else if (params.data.head === 'Omitted Items') {
        style.background = 'rgba(240,240, 240, 1)';
        style.color = 'rgba(160,160,160,1)';
      } else {
        style.background = '#fff';
      }


      /* Discarded column cell style */
      if (column && !(column as CFStaticColumn).isStatic) {
        if ((column as CFDataColumn).discard) {
          style.background = '#eee';
          style.color = '#aaa';
        }
      }

      if (params?.colDef?.colId === 'lineItem' && !params.value) {
        style.background = '#FFCCCB';
      }
      if (params?.colDef?.type === 'numericColumn' && isNaN(params.value)) {
        style.color = '#8B0000';
        style.background = '#FFCCCB';
      }

      const dtColumn = column as CFDataColumn;

      if (dtColumn?.type === 'actual-total' && params.value !== '') {
        const periodEndDate = DateTime.fromISO(dtColumn.periodEndDate);
        let periodStartDate = null;
        if (dtColumn.period === 'ytd' || dtColumn.period === 'yearly') {
          periodStartDate = periodEndDate.startOf('year');
        } else if (dtColumn.period === 'ttm') {
          periodStartDate = periodEndDate.minus({ months: 12, day: -1 });
        }

        const colsToAdd = this.state.colData
          .filter(
            (col: CFDataColumn) => {
              const endDate = DateTime.fromISO(col.periodEndDate).minus({ day: 1 });
              return !col.discard && col.type === 'actual' && endDate > periodStartDate && endDate < periodEndDate;
            },
          ).map((col: CFDataColumn) => col.key);

        const total = colsToAdd.reduce((total: number, colKey: string) => {
          const amount = Number(params.data[colKey]);
          return total + (isNaN(amount) ? 0 : amount);
        }, 0);

        const totalMatches = Math.abs(total - Number(params.value)) < 0.001;

        if (!totalMatches) {
          style.color = '#cc3333';
        }
      }
    } else {
      /* Summary row cells styling */
      style.background = '#222';
      style.color = '#ddd';

      if (column && !(column as CFStaticColumn).isStatic) {
        if (params.data.hasOwnProperty('matched')) {
          const key = params.colDef.field;
          if (params.data.matched.includes(key)) {
            style.background = '#252';
          }
        }

        if (Number(params.value) < 0) {
          style.color = '#f88';
        }

        if ((column as CFDataColumn).discard) {
          style.background = '#888';
        }
      } else {
        if (params.colDef.colId === 'lineItem') {
          style.background = '#fff';
        }
      }
    }

    if (this.highlightedRowIndex === params.rowIndex) {
      style.background = '#FFCCCB';
    }

    return style;
  };

  buildColumnDefinitions(cfColumns: CFColumn[]): ColDef[] {
    const keyColumns: ColDef[] = [{
      colId: 'id',
      pinned: 'left',
      resizable: false,
      initialWidth: 50,
      headerClass: 'rr-column-header',
      suppressMenu: true,
      type: 'numericColumn',
      valueGetter: (params) => {
        return params.data.__isSummary ? '' : params.node.data.__rowIndex + 1;
      },
      cellRenderer: (props) => (
        <IDCell
          {...props} onDelete={this.handleRowDelete} onInsert={this.handleRowInsert} readonly={this.props.readonly}
        />
      ),
      cellStyle: this.cellStyle.bind(null, null),
    }];
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      currencySign: 'accounting',
    });
    const dataColumns: ColDef[] = [];
    const hiddenColumns = ['head', 'category'];

    cfColumns.forEach((column: CFColumn, i) => {
      if (hiddenColumns.includes(column.key)) {
        return;
      }

      const colDef: ColDef = {
        field: column.key,
        colId: column.key,
        resizable: true,
        headerClass: 'os-column-header',
        headerComponent: CFStaticColumnHeader,
        menuTabs: ['filterMenuTab', 'generalMenuTab'],
        headerComponentParams: {
          cfColumn: column,
          clearClassification: this.props.clearClassification,
          isReadOnly: this.props.readonly,
        },
      };

      if (column.key === 'lineItem') {
        keyColumns.push({
          ...colDef,
          editable: (params: EditableCallbackParams) => {
            return !this.props.readonly && !params.data.__isSummary;
          },
          headerName: column.label,
          initialWidth: 180,
          pinned: 'left',
          cellStyle: this.cellStyle.bind(null, column),
          ...TextFilterParams,
        });
      } else if ((column as CFStaticColumn).isStatic) {
        alert('oops');
      } else {
        const dColumn: CFDataColumn = column as CFDataColumn;
        dataColumns.push({
          ...colDef,
          hide: this.props.readonly && dColumn.discard,
          editable: (params: EditableCallbackParams) => {
            return !dColumn.discard && !this.props.readonly && !params.data.__isSummary;
          },
          initialWidth: 164,
          type: 'numericColumn',
          valueParser: (params) => {
            const value = Number(params.newValue);
            return isNaN(value) ? 0 : value;
          },
          valueFormatter: (params) => {
            if (params.data.head || params.data.category || params.value) {
              return formatter.format(isNaN(parseFloat(params.value)) ? 0 : params.value);
            }
            return '';
          },
          cellStyle: this.cellStyle.bind(null, column),
          headerComponent: CFDataColumnHeader,
          headerComponentParams: {
            readonly: this.props.readonly,
            onChange: (value: CFDataColumn) => this.updateColData(i, value),
            value: {
              key: dColumn.key,
              type: dColumn.type,
              period: dColumn.period,
              periodEndDate: dColumn.periodEndDate,
              discard: dColumn.discard,
            },
          },
          ...NumberFilterParams,
        });
      }
    });

    keyColumns.push({
      field: null,
      colId: 'headCat',
      pinned: 'left',
      resizable: true,
      headerClass: 'os-column-header',
      headerComponent: CFStaticColumnHeader,
      menuTabs: ['filterMenuTab', 'generalMenuTab'],
      headerComponentParams: {
        cfColumn: { label: 'Category' },
        clearClassification: this.props.clearClassification,
        isReadOnly: this.props.readonly,
      },
      ...TextFilterParams,
      editable: (params: EditableCallbackParams) => {
        return !this.props.readonly && !params.data.__isSummary;
      },
      cellEditor: AGHeadCategoryPicker,
      cellEditorPopup: true,
      singleClickEdit: true,
      valueSetter: (params: ValueSetterParams) => {
        const [head, category] = params.newValue ? params.newValue.split(' | ') : [undefined, undefined];
        params.data.head = head ?? '';
        params.data.category = category ?? '';
        this.gridRef.current.api.refreshCells({ rowNodes: [params.node], force: true });
        return true;
      },
      valueGetter: (params: ValueGetterParams) => {
        const { head, category } = params.data;
        if (head && category) {
          return category;
        }
        return '';
      },
      cellStyle: this.cellStyle.bind(null, null),
    });

    const columns: ColDef[] = [...keyColumns, ...dataColumns];
    return columns;
  }

  private getContextMenuItems = (params: GetContextMenuItemsParams) => {
    const rowIndex = params.node.data.__rowIndex;
    const isIdCell = params.column.getColId() === 'id';

    if (isIdCell) {
      return [
        {
          name: `Insert Rows Above`,
          action: () => this.handleRowInsert(rowIndex, true),
        },
        {
          name: `Insert Rows Below`,
          action: () => this.handleRowInsert(rowIndex, false),
        },
        {
          name: `Delete Rows`,
          action: () => this.handleRowDelete(rowIndex),
        },
      ];
    }

    return [
      'cut', 'copy', 'paste',
    ];
  };
  private getMainMenuItems = (params: GetMainMenuItemsParams) => {
    const colId = params.column.getColId();
    if (colId.startsWith('col')) {
      const dataColumnItems: (string | MenuItemDef)[] = [
        {
          name: 'Add Column To Left',
          action: () => this.addColumnBefore(colId),
        },
        {
          name: 'Add Column To Right',
          action: () => this.addColumnAfter(colId),
        },
        {
          name: 'Delete Column',
          action: () => this.deleteColumn(colId),
        },
      ];
      return [...dataColumnItems, 'separator', ...params.defaultItems];
    }

    return params.defaultItems;
  };

  deleteColumn = (columnKey: string) => {
    const { colData } = this.state;
    const colIndex = colData.findIndex((c) => c.key === columnKey);
    this.setState({
      colData: [...colData.slice(0, colIndex), ...colData.slice(colIndex + 1)],
    }, () => this.triggerDataChangeEvent());
  };

  addColumn = (columnKey: string, relativePos) => {
    const { colData } = this.state;
    const colIndex = colData.findIndex((c) => c.key === columnKey);
    const keyIndexes = colData.map((c) => parseInt(c.key.substring(3))).filter((n) => !isNaN(n));
    const maxKeyIndex = Math.max(...keyIndexes);

    const newColumn: CFDataColumn = {
      key: `col${maxKeyIndex + 1}`,
      type: 'actual',
      period: 'monthly',
      periodEndDate: DateTime.now().endOf('month').toISODate(),
      label: '',
      discard: false,
    };

    this.setState({
      colData: [...colData.slice(0, colIndex + relativePos), newColumn, ...colData.slice(colIndex + relativePos)],
    }, () => this.triggerDataChangeEvent());
  };

  addColumnBefore = (columnKey: string) => {
    this.addColumn(columnKey, 0);
  };

  addColumnAfter = (columnKey: string) => {
    this.addColumn(columnKey, 1);
  };

  refreshHeaders = () => {
    this.gridRef.current.api.refreshHeader();
  };
  cellValueChanged = async (e: CellValueChangedEvent) => {
    // if (e.colDef.colId === 'headCat') {
    //   this.updateNOINCFSelectedFlags(this.state.rowData);
    // }
    await this.triggerDataChangeEvent(false);
  };

  selectionChanged = ({ api }: { api: GridApi }) => {
    const newSelectedNodes = api.getSelectedNodes();
    const newSelectedNodesSet = new Set(newSelectedNodes);
    const newlySelected = newSelectedNodes.filter((n) => !this.selectedNodesSet.has(n));
    const newlyDeselected = this.selectedNodes.filter((n) => !newSelectedNodesSet.has(n));
    this.selectedNodes = newSelectedNodes;
    this.selectedNodesSet = newSelectedNodesSet;
    api.refreshCells({
      rowNodes: [...newlySelected, ...newlyDeselected],
      force: true,
      columns: ['id'],
    });
    this.props.onRowSelectionChanged?.(newSelectedNodes.map((r: RowNode) => r.data.__rowIndex));
  };

  handleCellEditingStarted = (e: CellEditingStartedEvent) => {
    // @ts-ignore
    if (e.event?.code === 'Delete' || e.event?.code === 'Backspace') {
      if (e.colDef.colId === 'headCat') {
        e.api.stopEditing(true);
        this.setState({
          rowData: [
            ...this.state.rowData.slice(0, e.rowIndex),
            {
              ...this.state.rowData[e.rowIndex],
              head: '',
              category: '',
            },
            ...this.state.rowData.slice(e.rowIndex + 1),
          ],
        }, () => {
          this.gridRef.current.api.refreshCells({ force: true });
          this.triggerDataChangeEvent().catch(console.error);
        });
      }
    }
  };

  handleCellEditingStopped = (e: CellEditingStoppedEvent) => {
    const totalColumns = this.state.colData
      .filter((col: CFDataColumn) => col.type === 'actual-total')
      .map((col: CFDataColumn) => col.key);

    this.gridRef.current.api.refreshCells({ columns: totalColumns, force: true });
  };

  handleCellKeyDown = async (e: CellKeyDownEvent) => {
    // @ts-ignore-
    if (e.event.metaKey || e.event.ctrlKey) {
      // @ts-ignore
      if (e.event.code === 'KeyZ') {
        this.undo();
      }
      // @ts-ignore
      if (e.event.code === 'KeyY') {
        this.redo();
      }
      // @ts-ignore
      if (e.event.code === 'KeyS') {
        !this.props.isFreeAccount && this.props.onSave();
      }
      // @ts-ignore
      if (e.event.code === 'KeyC' && navigator.clipboard) { // copy to clipboard
        if (e?.colDef?.colId === 'headCat') {
          await navigator.clipboard.writeText(`${e?.data?.head} | ${e?.data?.category}`);
        } else {
          await navigator.clipboard.writeText(e?.data[e?.colDef?.colId]);
        }
      }
      // @ts-ignore
      if (e.event.code === 'KeyV' && navigator.clipboard) {
        const text = await navigator.clipboard.readText();
        this.pasteCellValue(e, text);
      }
    }
  };

  pasteCellValue(e: CellKeyDownEvent, text: any) {
    if (e.colDef.editable && !!text) {
      let update;
      if (e.colDef?.type === 'numericColumn' && !isNaN(Number(text)) && isFinite(Number(text))) {
        update = { [e.colDef.colId]: Number(text) };
      } else if (e.colDef?.colId === 'lineItem' && typeof text === 'string') {
        update = { [e.colDef.colId]: text };
      } else if (e?.colDef?.colId === 'headCat' && typeof text === 'string' && text.includes('|')) {
        const headCat = text.split('|');
        const head = headCat[0].trim();
        const category = headCat[1].trim();
        if (Reflect.ownKeys(this.props.coa).includes(head) && this.props.coa[head].includes(category)) {
          update = { head, category };
        }
      }
      if (update) {
        e.api.stopEditing(true);
        this.setState({
          rowData: [
            ...this.state.rowData.slice(0, e.rowIndex),
            {
              ...this.state.rowData[e.rowIndex],
              ...update,
            },
            ...this.state.rowData.slice(e.rowIndex + 1),
          ],
        }, () => {
          this.triggerDataChangeEvent().catch(console.error);
          this.gridRef.current.api.refreshCells({ rowNodes: [e.node], force: true });
        });
      }
    }
  }


  render() {
    const columnDefinitions = this.buildColumnDefinitions(this.state.colData);
    // eslint-disable-next-line no-unused-vars
    const { wrapperProps } = this.props;
    return (
      <chakra.div className="ag-theme-balham" {...wrapperProps}>
        <AgGridReact
          ref={this.gridRef}
          rowData={this.state.rowData}
          columnDefs={columnDefinitions}
          animateRows={true}
          suppressMovableColumns={true}
          headerHeight={120}
          rowSelection="multiple"
          rowMultiSelectWithClick={false}
          getRowId={getRowId}
          groupHeaderHeight={40}
          onCellValueChanged={this.cellValueChanged}
          pinnedBottomRowData={this.state.summaryRows}
          rowHeight={20}
          onFilterChanged={this.refreshHeaders}
          onSelectionChanged={this.selectionChanged}
          onCellEditingStarted={this.handleCellEditingStarted}
          onCellEditingStopped={this.handleCellEditingStopped}
          enableCellChangeFlash={false}
          onCellKeyDown={this.handleCellKeyDown}
          enableRangeSelection={true}
          statusBar={statusBar}
          getMainMenuItems={(p) => this.getMainMenuItems(p)}
          getContextMenuItems={(p) => this.getContextMenuItems(p)}
        />
      </chakra.div>
    );
  }

  triggerDataChangeEvent = async (dontPush: boolean = false) => {
    await this.updateSummaryRows();
    if (!dontPush) {
      this.undoManager.push({
        ...this.state,
        rowData: addRowIndex(copyData<CFDataRow>(this.state.rowData)),
      });
    }
    this.props.onDataChange(this.getData());
    !this.props.isFreeAccount && this.props.onSave();
  };

  undo() {
    if (this.undoManager.canUndo()) {
      const state = this.undoManager.undo();
      this.setState(
        {
          ...state,
          rowData: addRowIndex(copyData<CFDataRow>(state.rowData)),
        },
        () => {
          this.gridRef.current.api.refreshCells({ force: true });
          this.triggerDataChangeEvent(true).catch(console.error);
        },
      );
    }
  }

  redo() {
    if (this.undoManager.canRedo()) {
      const state = this.undoManager.redo();
      this.setState(
        {
          ...state,
          rowData: addRowIndex(copyData<CFDataRow>(state.rowData)),
        },
        () => {
          this.gridRef.current.api.refreshCells({ force: true });
          this.triggerDataChangeEvent(true).catch(console.error);
        },
      );
    }
  }

  updateColData = (i, value: CFDataColumn) => {
    const column = this.state.colData[i];
    if ((column as CFStaticColumn).isStatic) {
      console.error('Trying to update static column, something is not right');
    } else {
      const col: CFDataColumn = {
        ...column as CFDataColumn,
        discard: value.discard,
        type: value.type,
        period: value.period,
        periodEndDate: value.periodEndDate,
      };

      this.setState({
        colData: [...this.state.colData.slice(0, i), col, ...this.state.colData.slice(i + 1)],
      }, () => this.triggerDataChangeEvent());
    }
  };

  private async updateSummaryRows() {
    const cashFlowDataService: CashFlowDataService = CashFlowDataService.getService();
    const summaryRows = cashFlowDataService.getCFSheetSummaryRows(this.getData());

    return new Promise((resolve) => {
      this.setState({
        summaryRows,
      }, () => resolve(undefined));
    });
  }
}

export type CashFlowEditorWrapperProps = Omit<CashFlowEditorProps, 'coa'>;

export const CashFlowEditorWrapper = forwardRef(
  function CashFlowEditorWrapper(props: CashFlowEditorWrapperProps, ref: ForwardedRef<any>) {
    const { coaObj } = useAccountCOA();
    return (
      <CashFlowEditor {...props} coa={coaObj} ref={ref}/>
    );
  },
);
