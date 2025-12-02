import { chakra, FlexProps } from '@chakra-ui/react';
import {
  Deal,
  DealDocument,
  DocumentData,
  DocumentDataEditor,
  OccupancyConfig,
  RentRollExtraData,
  RRFColumn,
  RRFDataColumn, RRFDataFieldType,
  RRFDataRow,
  RRFExtractedData,
  RRFStaticColumn,
} from '../../../../../../../types';
import React from 'react';
import memoizeOne from 'memoize-one';
import {
  CellClassParams,
  CellEditingStartedEvent,
  CellKeyDownEvent,
  ColDef, EditableCallbackParams, GetContextMenuItemsParams, GetMainMenuItemsParams,
  GridApi, IRowNode, MenuItemDef,
} from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import { RentRollDataService } from '../../../../../../services/document/RentRollDataService';
import { RRFDataColumnHeader } from './RRFDataColumnHeader';
import { AGDatePicker } from '../../editor/AGDatePicker';
import { IDCell } from '../../editor/IDCell';
import { UndoManager } from '../../../../../../services/utils/UndoManager';
import {
  copyData,
  DateFilterParams,
  formatValue,
  getRowId,
  getValue,
  NumberFilterParams,
  TextFilterParams,
} from './utils';
import { EnumType } from '../../../../../../../bootstrap/utils/Enum';
import { AGBooleanPicker } from '../../editor/AGBooleanPicker';
import { AGEnumPicker } from '../../editor/AGEnumPicker';
import {
  RentRollFixedField,
  RRLeaseTermsField,
  RRUnitInformationField,
} from '../../../../../../enums/RentRollFieldEnum';
import { DateTime } from 'luxon';

const BooleanPickerProps = {
  cellEditor: AGBooleanPicker,
  cellEditorPopup: true,
  singleClickEdit: true,
};

const enumPickerProps = (enumType: EnumType) => ({
  cellEditor: AGEnumPicker,
  cellEditorPopup: true,
  singleClickEdit: true,
  cellEditorParams: {
    enumType,
  },
});

export interface RentRollEditorProps {
  deal: Deal;
  document: DealDocument;
  documentData: DocumentData;
  data: RRFExtractedData;
  onDataChange: (data: RRFExtractedData) => void;
  extraData: RentRollExtraData;
  readonly?: boolean;
  wrapperProps?: FlexProps;
  occupancyConfig?: OccupancyConfig;
  onSave: () => void;
  showColumns: RRFDataFieldType;
  isFreeAccount: boolean;
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

export type RRFDataRowWithIndex = RRFDataRow & { __rowIndex: number };

function addRowIndex(rowData: RRFDataRow[]): RRFDataRowWithIndex[] {
  return rowData.map((r, i) => ({ ...r, __rowIndex: i }));
}

interface RentRollEditorState {
  colData: RRFColumn[],
  summaryRows: RRFDataRow[],
  rowData: RRFDataRowWithIndex[],
}

export class RentRollEditor
  extends React.Component<RentRollEditorProps, RentRollEditorState>
  implements DocumentDataEditor {
  private gridRef = React.createRef<AgGridReact>();
  public readonly undoManager = new UndoManager<RentRollEditorState>();
  private selectedNodes: IRowNode[] = [];
  private selectedNodesSet: Set<IRowNode> = new Set([]);
  private highlightedRowIndex: number = null;

  constructor(props: RentRollEditorProps) {
    // noinspection DuplicatedCode
    super(props);
    const data: RRFExtractedData = (props.documentData.editedData?.columns ?
      props.documentData.editedData :
      props.documentData.extractedData) as RRFExtractedData;

    this.state = {
      colData: copyData<RRFColumn>(data.columns),
      summaryRows: [],
      rowData: addRowIndex(copyData<RRFDataRow>(data.rows)),
    };

    this.buildColumnDefinitions = memoizeOne(this.buildColumnDefinitions.bind(this));
  }

  setHighlightedRow(rowIdx) {
    this.highlightedRowIndex = rowIdx;
    this.gridRef.current.api.refreshCells({ force: true });
    this.gridRef.current.api.ensureIndexVisible(rowIdx, 'middle');
  }

  componentDidMount() {
    this.triggerDataChangeEvent().catch(console.error);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.data !== this.props.data) {
      this.refreshHeaders();
    }
  }

  handleRowDelete = (__rowIndex: number) => {
    const selectedNodes = this.gridRef.current.api.getSelectedNodes();
    let rowData: RRFDataRow[];
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
      return this.triggerDataChangeEvent();
    });
  };

  handleRowInsert = (__rowIndex: number, before: boolean = true) => {
    const selectedNodes = this.gridRef.current.api.getSelectedNodes();
    let rowData: RRFDataRow[];

    function emptyRow() {
      return { id: Math.floor(Math.random() * 100000) + 100000 };
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
      this.triggerDataChangeEvent().catch(console.error);
    });
  };

  cellStyle = (column: RRFColumn, params: CellClassParams) => {
    const rentRollDataService: RentRollDataService = RentRollDataService.getService();
    const isSelected = this.gridRef.current.api.getSelectedNodes().includes(params.node);
    if (params.colDef.colId === 'id') {
      return {
        border: 'none',
        borderRight: isSelected ? '1px solid #777' : '1px solid #ccc',
        background: isSelected ? '#bbb' : '#ddd',
        padding: 0,
        color: '#333',
      };
    }

    const dColumn = column as RRFDataColumn;

    if (params.data.__isSummary) {
      return {
        border: 'none',
        borderRight: '1px solid #aaa',
        background: dColumn.discard ? '#777' : '#333',
        color: '#fff',
      };
    }

    const style = {
      border: undefined,
      borderRight: undefined,
      borderColor: undefined,
      background: '#fff',
      color: undefined,
    };

    if (dColumn.discard) {
      style.background = '#eee';
      style.color = '#aaa';
    }

    if (params.rowIndex === this.highlightedRowIndex) {
      style.background = '#FFCCCB';
    }
    const validValue = rentRollDataService.checkColumnValue(column, params.value);
    if (!validValue) {
      style.color = '#8B0000';
      style.background = '#FFCCCB';
    }
    return style;
  };

  // The method is memoized, hence some extra values are passed to ensure a rebuild when really needed
  buildColumnDefinitions(
    rrColumns: RRFColumn[],
    document: DealDocument,
    showColumns: RRFDataFieldType,
  ): ColDef[] {
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

    const dataCCColumns: ColDef[] = [];
    const rentRollDataService: RentRollDataService = RentRollDataService.getService();

    rrColumns.forEach((column, i) => {
      const dColumn = column as RRFDataColumn;
      if (showColumns && dColumn.type !== showColumns && dColumn.name !== RRUnitInformationField.unit.key) {
        return;
      }

      let colDef: Partial<ColDef> = {
        field: column.key,
        colId: column.key,
        resizable: true,
        suppressMenu: true,
        ...TextFilterParams,
        valueFormatter: (params) => formatValue(params, dColumn),
        valueGetter: (params) => getValue(params, dColumn),
        hide: this.props.readonly && dColumn.discard,
        pinned: dColumn.name === RRUnitInformationField.unit.key,
      };

      if (dColumn.type === 'chargeCode') {
        colDef.type = 'numericColumn';
        colDef = { ...colDef, ...NumberFilterParams };
      } else {
        const field = rentRollDataService.getRRColumnField(dColumn as RRFDataColumn);
        if (field) {
          if (['amount', 'amount_psf'].includes(field.options.type)) {
            colDef.type = 'numericColumn';
            colDef = { ...colDef, ...NumberFilterParams };
          } else if (field.options.type === 'number') {
            colDef.type = 'numericColumn';
            colDef = { ...colDef, ...NumberFilterParams };
          } else if (field.options.type === 'date') {
            colDef = {
              ...colDef,
              ...DateFilterParams,
              cellEditor: AGDatePicker,
            };
          } else if (field.options.type === 'bool') {
            colDef = {
              ...colDef,
              ...BooleanPickerProps,
            };
          } else if (field.options.type === 'enum') {
            colDef = {
              ...colDef,
              ...enumPickerProps(field.options.enumType),
            };
          }
        }
      }

      const dataOrCCColumn = {
        ...colDef,
        headerClass: 'rr-column-header',
        editable: (params: EditableCallbackParams) => {
          return !dColumn.discard && !this.props.readonly && !params.data.__isSummary;
        },
        initialWidth: 170,
        // type: ??,
        cellStyle: this.cellStyle.bind(null, dColumn),
        headerComponent: (props) => (
          <>
            <RRFDataColumnHeader
              {...props} data={this.props.data} extraData={this.props.extraData} columnData={column}
              dealId={this.props.deal?.id} document={this.props.document} readonly={this.props.readonly}
            />
          </>
        ),
        headerComponentParams: {
          onChange: (columnData: RRFDataColumn) => this.updateColData(i, columnData),
          onAddColumnAfter: this.addColumnAfter,
          onAddColumnBefore: this.addColumnBefore,
          onDeleteColumn: this.deleteColumn,
          onValuesUpdate: this.handleColumnValuesUpdate,
        },
      };

      dataCCColumns.push(dataOrCCColumn);
    });

    const allColumns = [...keyColumns, ...dataCCColumns];

    allColumns.sort((col1, col2) => {
      if (col2.colId === 'id') {
        return 1;
      }

      return 0;
    });

    return allColumns;
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

  getData() {
    return {
      columns: this.state.colData,
      rows: this.state.rowData,
    };
  }

  handleColumnValuesUpdate = (column: RRFDataColumn, values: any[]) => {
    const rowData: RRFDataRowWithIndex[] = [];

    values.forEach((value: any, index: number) => {
      // TODO: this is temporary just to show the data till we have a custom cell to display booleans
      rowData.push({
        ...this.state.rowData[index],
        [column.key]: typeof value === 'boolean' ? value ? 'Yes' : 'No' : value,
      });
    });

    this.setState({ rowData }, async () => {
      await this.triggerDataChangeEvent();
    });
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

    const newColumn: RRFDataColumn = {
      key: `col${maxKeyIndex + 1}`,
      name: '',
      header: `custom_${maxKeyIndex + 1}`,
      sourceColumnIndex: null,
      type: 'unitInformation',
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

  triggerDataChangeEvent = async (dontPush: boolean = false) => {
    await this.updateSummaryRows();
    if (!dontPush) {
      this.undoManager.push({
        ...this.state,
        rowData: addRowIndex(copyData<RRFDataRow>(this.state.rowData)),
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
          rowData: addRowIndex(copyData<RRFDataRow>(state.rowData)),
        },
        () => this.triggerDataChangeEvent(true),
      );
    }
  }

  redo() {
    if (this.undoManager.canRedo()) {
      const state = this.undoManager.redo();
      this.setState(
        {
          ...state,
          rowData: addRowIndex(copyData<RRFDataRow>(state.rowData)),
        },
        () => this.triggerDataChangeEvent(true),
      );
    }
  }

  updateColData = (i, value: RRFDataColumn) => {
    const column = this.state.colData[i];
    if ((column as RRFStaticColumn).isStatic) {
      console.error('Trying to update static column, something is not right');
    } else {
      const col: RRFDataColumn = {
        ...column as RRFDataColumn,
        discard: value.discard,
        type: value.type,
        name: value.name,
        originalName: value.originalName,
      };

      this.setState({
        colData: [...this.state.colData.slice(0, i), col, ...this.state.colData.slice(i + 1)],
      }, () => this.triggerDataChangeEvent());
    }
  };

  private async updateSummaryRows() {
    const rentRollDataService: RentRollDataService = RentRollDataService.getService();
    const summaryRows = rentRollDataService.getColumnWiseSummary(this.getData());
    return new Promise((resolve) => {
      this.setState({
        summaryRows,
      }, () => resolve(undefined));
    });
  }

  refreshHeaders = () => {
    this.gridRef.current.api.refreshHeader();
  };

  handleCellChanged = () => {
    return this.triggerDataChangeEvent();
  };

  handleCellEditingStarted = (e: CellEditingStartedEvent) => {
    // @ts-ignore
    if (e.event?.code === 'Delete' || e.event?.code === 'Backspace') {
      let setColEmpty = false;
      const column = this.state.colData.find((col) => col.key === e.colDef.colId);
      const rentRollFixedField = RentRollFixedField.all().find((field) => field.key === column.name);
      const rentRollLeaseTermField = RRLeaseTermsField.all().find((field) => field.key === column.name);
      if (rentRollFixedField && ['bool', 'enum'].includes(rentRollFixedField.options.type)) {
        setColEmpty = true;
      } else if (rentRollLeaseTermField && rentRollLeaseTermField.options.type === 'date') {
        setColEmpty = true;
      }
      if (setColEmpty) {
        e.api.stopEditing(true);
        this.setState({
          rowData: [
            ...this.state.rowData.slice(0, e.rowIndex),
            {
              ...this.state.rowData[e.rowIndex],
              [e.colDef.colId]: '',
            },
            ...this.state.rowData.slice(e.rowIndex + 1),
          ],
        }, () => {
          this.triggerDataChangeEvent().catch(console.error);
        });
      }
    }
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
  };

  handleCellKeyDown = async (e: CellKeyDownEvent) => {
    // @ts-ignore-
    if (e.event.metaKey || e.event.ctrlKey) {
      // @ts-ignore
      if (e.event.code === 'KeyZ') { // undo
        this.undo();
      }
      // @ts-ignore
      if (e.event.code === 'KeyY') { // redo
        this.redo();
      }
      // @ts-ignore
      if (e.event.code === 'KeyS') { // save
        !this.props.isFreeAccount && this.props.onSave();
      }
      // @ts-ignore
      if (e.event.code === 'KeyC' && navigator.clipboard) { // copy to clipboard
        await navigator.clipboard.writeText(e?.data[e?.colDef?.colId]);
      }
      // @ts-ignore
      if (e.event.code === 'KeyV' && navigator.clipboard) { // paste value from clipboard
        const text = await navigator.clipboard.readText();
        this.pasteCellValue(e, text);
      }
    }
  };

  pasteCellValue(e: CellKeyDownEvent, text: any) {
    const rentRollDataService: RentRollDataService = RentRollDataService.getService();
    let update;
    const column = this.state.colData.find((col) => col.key === e.colDef.colId);
    const field = rentRollDataService.getRRColumnField(column as RRFDataColumn);
    if (field) {
      if (e.colDef.editable && !!text) {
        if (['amount', 'amount_psf', 'number'].includes(field?.options?.type) &&
          !isNaN(Number(text)) && isFinite(Number(text))) {
          update = { [e.colDef.colId]: Number(text) };
        } else if (!field?.options?.type && typeof text === 'string') {
          update = { [e.colDef.colId]: text };
        } else if (field?.options?.type === 'bool' && ['Yes', 'No'].includes(text)) {
          update = { [e.colDef.colId]: text };
        } else if (field?.options?.type === 'enum' &&
          field?.options?.enumType.all().map((k) => k.key).includes(text)) {
          update = { [e.colDef.colId]: text };
        } else if (field?.options?.type === 'date') {
          const dateTime = DateTime.fromFormat(text, 'mm/dd/yyyy');
          if (dateTime.isValid) {
            update = { [e.colDef.colId]: dateTime.toFormat('mm/dd/yyyy') };
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
          });
        }
      }
    }
  }

  render() {
    const columnDefinitions = this.buildColumnDefinitions(
      this.state.colData, this.props.document, this.props.showColumns,
    );
    // eslint-disable-next-line no-unused-vars
    const { wrapperProps } = this.props;
    return (
      <chakra.div className="ag-theme-balham" {...wrapperProps}>
        <AgGridReact
          ref={this.gridRef}
          rowData={this.state.rowData}
          suppressMovableColumns={true}
          getRowId={getRowId}
          animateRows={true}
          onSelectionChanged={this.selectionChanged}
          pinnedBottomRowData={this.state.summaryRows}
          columnDefs={columnDefinitions}
          headerHeight={120}
          groupHeaderHeight={40}
          onCellValueChanged={this.handleCellChanged}
          onFilterChanged={this.refreshHeaders}
          rowHeight={22}
          rowSelection="multiple"
          rowMultiSelectWithClick={false}
          onCellEditingStarted={this.handleCellEditingStarted}
          onCellKeyDown={this.handleCellKeyDown}
          rowBuffer={30}
          statusBar={statusBar}
          enableRangeSelection={true}
          getContextMenuItems={(p) => this.getContextMenuItems(p)}
        />
      </chakra.div>
    );
  }
}

