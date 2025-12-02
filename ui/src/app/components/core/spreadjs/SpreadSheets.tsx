import React, { ReactNode } from 'react';
import { FunctionIcon } from '../../app/icons';
import { ACTIONS, SpreadSheetToolbar } from './SpreadSheetToolbar';
import { setHorizontalAlignmentCommand } from './commands/SetHorizontalAlignmentCommand';
import { freezeCommand } from './commands/FreezeCommand';
import { sortCommand } from './commands/SortCommand';
import {
  boldTextFormatCommand,
  italicTextFormatCommand,
  textFormatCommand,
  underlineTextFormatCommand,
} from './commands/TextFormatCommand';
import { setFormatCommand } from './commands/SetFormatCommand';
import { setColorCommand } from './commands/SetColorCommand';
import { setFilterCommand } from './commands/SetFilterCommand';
import { pasteFormatCommand } from './commands/PasteFormatCommand';
import { FORMATS } from './FormatMenuButton';
import { appConfig } from '../../../../config';
import { SelectionChangedEvent } from './events/SelectionChangedEvent';
import { SelectionChangingEvent } from './events/SelectionChangingEvent';
import { noopFunc } from '../../../../bootstrap/utils/noop';
import { deleteRowColumnCommand } from './commands/RowColDeletionCommand';
import { insertRowColumnCommand } from './commands/RowColInsertionCommand';
import { selectRowCommand } from './commands/SelectRowCommand';
import { selectColumnCommand } from './commands/SelectColumnCommand';
import { setAbsoluteFormulaCommand } from './commands/SetAbsoluteFormulaCommand';
import { fillDataCommand } from './commands/FillDataCommand';
import { saveAs } from 'file-saver';

import '@grapecity/spread-sheets/styles/gc.spread.sheets.css';
import '@grapecity/spread-sheets/styles/gc.spread.sheets.excel2013lightGray.css';

import type GC from '@grapecity/spread-sheets';
import type GCExcel from '@grapecity/spread-excelio';
import { BaseCommand } from './commands/BaseCommand';
import { chakra, Flex, Icon, Input, Text } from '@chakra-ui/react';
import { FlexCol } from '../../../../bootstrap/chakra/components/layouts/FlexCol';
import { InputGroup, InputLeftElement } from '@chakra-ui/input';

let _GC;
let _GCExcel;

const SELECTION_TYPES = {
  LAST: 0,
  FIRST: 1,
  ALL: 2,
};

export interface SpreadsheetWrapper {
  spreadsheet: SpreadSheets,
}

export type GCRange = GC.Spread.Sheets.Range;
export type Worksheet = GC.Spread.Sheets.Worksheet;

export interface BorderStyle {
  color?: string,
  lineStyle?: string,
}

export interface StyleOptions {
  backColor?: string,
  foreColor?: string,
  borderTop?: BorderStyle,
  borderBottom?: BorderStyle,
  borderLeft?: BorderStyle,
  borderRight?: BorderStyle,
  hAlign?: boolean | number,
  vAlign?: boolean,
  font?: string,
}

export interface SpreadSheetsProps {
  sheetCount?: number,
  onReady: Function,
  toolbarCustomButtons?: ReactNode,
  toolbarCustomRightChild?: ReactNode,
  onRowColDeletion?: Function,
  onRowColInsertion?: Function,
  showToolbar?: boolean,
  downloadFileName?: string,
}

interface SpreadSheetsStateProps {
  selectedCellRange: string,
  copiedFormat: number,
}

export interface WorkbookData {
  sheets: {}[],
}

const customCommands = [
  { name: 'gc.spread.deleteRows', cmd: 'deleteRowColumnCommand' },
  { name: 'gc.spread.insertRows', cmd: 'insertRowColumnCommand' },
  { name: 'gc.spread.insertColumns', cmd: 'insertRowColumnCommand' },
  { name: 'gc.spread.deleteColumns', cmd: 'deleteRowColumnCommand' },
];

export class SpreadSheets extends React.Component<SpreadSheetsProps, SpreadSheetsStateProps> {
  private readonly spreadEl: React.RefObject<HTMLDivElement>;
  private readonly formulaEl: React.RefObject<HTMLInputElement>;
  workbook: GC.Spread.Sheets.Workbook;
  private formulaBox: GC.Spread.Sheets.FormulaTextBox.FormulaTextBox;

  static defaultProps = {
    sheetCount: 1,
    onRowColDeletion: noopFunc,
    onRowColInsertion: noopFunc,
    showDownloadButton: false,
    showToolbar: true,
    downloadFileName: 'spreadsheet.xlsx',
  };
  private observer: ResizeObserver;

  constructor(props) {
    super(props);
    this.spreadEl = React.createRef();
    this.formulaEl = React.createRef();
    this.workbook = null;

    this.state = {
      selectedCellRange: 'A1',
      copiedFormat: null,
    };

    this.observer = new ResizeObserver(this.redrawWorkbook);
  }

  get GC() {
    return _GC;
  }

  get GCExcel() {
    return _GCExcel;
  }

  get spreadsheet() {
    return this;
  }

  get isActiveSheetProtected(): boolean {
    return this.workbook.sheets[this.workbook.getActiveSheetIndex()].options.isProtected;
  }

  getActiveSheetIndex(): number {
    return this.workbook.getActiveSheetIndex();
  }

  // TODO: Add `data` type
  setSheetData(sheetIndex: number, data, readonly = false): void {
    this.suspend();
    this.workbook.sheets[sheetIndex].setDataSource(data);
    this.setColumnWidths(sheetIndex, 180);
    this.addAdditionalRowsColumns(sheetIndex, 50, 50);
    this.setSheetReadOnly(sheetIndex, readonly);
    this.resume();
  }

  setSheetReadOnly(sheetIndex: number, readonly: boolean): void {
    const sheet = this.workbook.sheets[sheetIndex];
    sheet.options.isProtected = readonly;
    sheet.options.protectionOptions.allowResizeRows = true;
    sheet.options.protectionOptions.allowResizeColumns = true;
    sheet.options.protectionOptions.allowFilter = true;
  }

  setSheetColumnCount(sheetIndex: number, count: number): void {
    const sheet = this.getSheet(sheetIndex);
    sheet.setColumnCount(count);
  }

  addAdditionalRowsColumns(sheetIndex: number, rowCount: number, colCount: number): void {
    const sheet = this.workbook.sheets[sheetIndex];
    const rc = sheet.getRowCount();
    const cc = sheet.getColumnCount();
    sheet.addColumns(cc, colCount);
    sheet.addRows(rc, rowCount);
  }

  suspend(): void {
    this.workbook.suspendPaint();
    this.workbook.suspendCalcService(false);
    this.workbook.suspendEvent();
  }

  resume(): void {
    this.workbook.resumeCalcService(true);
    this.workbook.resumeEvent();
    this.workbook.resumePaint();
  }

  setColumnWidths(sheetIndex: number, width: number = 200): void {
    this.suspend();
    const sheet = this.workbook.sheets[sheetIndex];
    const colCount = sheet.getColumnCount();
    for (let i = 0; i < colCount; i++) {
      sheet.setColumnWidth(i, width);
    }
    this.resume();
  }

  setSheetName(sheetIndex: number, name: string): void {
    this.getSheet(sheetIndex).name(name);
  }

  setActiveSheet(sheetName: string) {
    !!sheetName && this.workbook.setActiveSheet(sheetName);
  }

  getSheet(sheetIndex?: number): Worksheet {
    if (sheetIndex !== undefined) {
      return this.workbook.sheets[sheetIndex];
    }
    return this.workbook.getActiveSheet();
  }

  getCellValue(sheetIndex: number, row: number, col: number): any {
    return this.getSheet(sheetIndex).getCell(row, col).value();
  }

  getCellStyle(sheetIndex: number, row: number, col: number): GC.Spread.Sheets.Style {
    return this.getSheet(sheetIndex).getStyle(row, col);
  }

  setCellValue(sheetIndex: number, row: number, col: number, value: any): void {
    this.getSheet(sheetIndex).setValue(row, col, value);
  }

  setCellText(sheetIndex: number, row: number, col: number, value: any): void {
    this.getSheet(sheetIndex).setText(row, col, value);
  }

  getColumnValues(sheetIndex: number, row: number, rowCount: number, columnIndex: number): any[] {
    const cellValues = [];
    for (let i = row; i < rowCount + row; i++) {
      cellValues.push(this.getCellValue(sheetIndex, i, columnIndex));
    }
    return cellValues;
  }

  getColumnStyles(sheetIndex: number, row: number, rowCount: number, columnIndex: number): GC.Spread.Sheets.Style[] {
    const cellStyles = [];
    for (let i = row; i < rowCount + row; i++) {
      cellStyles.push(this.getCellStyle(sheetIndex, i, columnIndex));
    }
    return cellStyles;
  }

  setColumnHeader(sheetIndex: number, col: number, text: string) {
    const sheet = this.getSheet(sheetIndex);
    sheet.setText(0, col, text, _GC.Spread.Sheets.SheetArea.colHeader);
  }

  setCellStyle(sheetIndex: number, row: number, col: number, style: GC.Spread.Sheets.Style): void {
    this.getSheet(sheetIndex).setStyle(row, col, style);
  }

  /*
   * Add named style on sheet or on workbook if sheetIndex is null
   */
  addStyle(sheetIndex: number, styleName: string, {
    backColor, foreColor, borderTop, borderBottom, borderLeft, borderRight, hAlign = false, vAlign = false, font,
  }: StyleOptions): void {
    const style = new _GC.Spread.Sheets.Style();
    style.name = styleName;
    style.backColor = backColor;
    style.foreColor = foreColor;

    if (borderBottom) {
      style.borderBottom =
        new _GC.Spread.Sheets.LineBorder(borderBottom.color, _GC.Spread.Sheets.LineStyle[borderBottom.lineStyle]);
    }

    if (borderTop) {
      style.borderTop =
        new _GC.Spread.Sheets.LineBorder(borderTop.color, _GC.Spread.Sheets.LineStyle[borderTop.lineStyle]);
    }

    if (borderLeft) {
      style.borderLeft =
        new _GC.Spread.Sheets.LineBorder(borderLeft.color, _GC.Spread.Sheets.LineStyle[borderLeft.lineStyle]);
    }

    if (borderRight) {
      style.borderRight =
        new _GC.Spread.Sheets.LineBorder(borderRight.color, _GC.Spread.Sheets.LineStyle[borderRight.lineStyle]);
    }

    if (typeof hAlign === 'boolean') {
      if (hAlign) {
        style.hAlign = _GC.Spread.Sheets.HorizontalAlign.right;
      }
    } else if (typeof hAlign === 'number') {
      style.hAlign = hAlign;
    }


    if (vAlign) {
      style.vAlign = _GC.Spread.Sheets.VerticalAlign.center;
    }

    if (font) {
      style.font = font;
    }

    if (sheetIndex !== null) {
      this.getSheet(sheetIndex).addNamedStyle(style);
    } else {
      this.workbook.addNamedStyle(style);
    }
  }

  redrawWorkbook = () => {
    this.workbook?.refresh();
  };

  componentDidMount() {
    const { sheetCount, onReady } = this.props;

    const pGC = import('@grapecity/spread-sheets');
    const pGCExcel = import('@grapecity/spread-excelio');

    Promise.all([pGC, pGCExcel]).then(([vGC, vGCExcel]) => {
      _GC = vGC;
      _GCExcel = vGCExcel;

      _GC.Spread.Sheets.LicenseKey = appConfig.gcLicenseKey;
      _GCExcel.LicenseKey = appConfig.gcLicenseKey;

      this.workbook = new _GC.Spread.Sheets.Workbook(this.spreadEl.current, {
        sheetCount: sheetCount,
        grayAreaBackColor: '#FFFFFF',
        allowExtendPasteRange: true,
        newTabVisible: false,
        tabStripRatio: 0.4,
        tabEditable: false,
      });
      this.formulaBox = new _GC.Spread.Sheets.FormulaTextBox.FormulaTextBox(this.formulaEl.current, {});
      this.formulaBox.workbook(this.workbook);

      this.registerCommands();
      this.registerShortcutKeys();
      this.bindEvents();
      onReady();
    });

    this.observer.observe(this.spreadEl.current);
  }

  componentWillUnmount() {
    this.observer.disconnect();
  }

  registerCommands(): void {
    customCommands.forEach((e) => {
      const menuIndex = this.workbook.contextMenu.menuData.map((item) => item.name).indexOf(e.name);
      this.workbook.contextMenu.menuData[menuIndex].command = e.cmd;
    });

    this.registerCustomCommand('setHAlignCommand', setHorizontalAlignmentCommand);
    this.registerCustomCommand('freezeCommand', freezeCommand);
    this.registerCustomCommand('sortCommand', sortCommand);
    this.registerCustomCommand('setTextFormat', textFormatCommand);
    this.registerCustomCommand('setFormatCommand', setFormatCommand);
    this.registerCustomCommand('setColorCommand', setColorCommand);
    this.registerCustomCommand('setFilterCommand', setFilterCommand);
    this.registerCustomCommand('pasteFormatCommand', pasteFormatCommand);
    this.registerCustomCommand('deleteRowColumnCommand', deleteRowColumnCommand);
    this.registerCustomCommand('insertRowColumnCommand', insertRowColumnCommand);
    this.registerCustomCommand('selectRowCommand', selectRowCommand);
    this.registerCustomCommand('selectColumnCommand', selectColumnCommand);
    this.registerCustomCommand('setItalicTextCommand', italicTextFormatCommand);
    this.registerCustomCommand('setBoldTextCommand', boldTextFormatCommand);
    this.registerCustomCommand('setUnderlineTextCommand', underlineTextFormatCommand);
    this.registerCustomCommand('setAbsoluteFormulaCommand', setAbsoluteFormulaCommand, this, 115);
    this.registerCustomCommand('fillDataCommand', fillDataCommand, this, 'D'.charCodeAt(0), true, false, true);
  }

  registerShortcutKeys(): void {
    this.registerShortcutKey('selectRowCommand', _GC.Spread.Commands.Key.space, true, false, false, false);
    this.registerShortcutKey('selectColumnCommand', _GC.Spread.Commands.Key.enter, true, false, false, false);
    // this.registerShortcutKey('deleteRowColumnCommand', 109, true, false, true, false);
    this.registerShortcutKey('deleteRowColumnCommand', 189, true, false, true, false);
    // this.registerShortcutKey('insertRowColumnCommand', 107, true, false, true, false);
    this.registerShortcutKey('insertRowColumnCommand', 187, true, false, true, false);

    this.registerShortcutKey('setItalicTextCommand', 73, true, false, false, false);
    this.registerShortcutKey('setBoldTextCommand', 'B'.charCodeAt(0), true, false, false, false);
    this.registerShortcutKey('setUnderlineTextCommand', 'U'.charCodeAt(0), true, false, false, false);
  }

  registerShortcutKey(
    command: string, key: GC.Spread.Commands.Key, ctrl: boolean, shift: boolean, alt: boolean, meta: boolean,
  ): void {
    this.workbook.commandManager().setShortcutKey(command, key, ctrl, shift, alt, meta);
  }

  updateSelectionState(): void {
    const sheet = this.getSheet();
    const selection = sheet.getSelections().pop();
    if (selection) {
      const selectedRange = this.getSelectedRangeString(sheet, selection);
      this.setState({
        selectedCellRange: selectedRange,
      });
    }
  }

  bindEvents(): void {
    this.registerEvent(_GC.Spread.Sheets.Events.SelectionChanged, SelectionChangedEvent.get());
    this.registerEvent(_GC.Spread.Sheets.Events.SelectionChanging, SelectionChangingEvent.get());
  }

  autoFitColumns(sheetIndex, padding = 20): void {
    this.suspend();
    const sheet = this.getSheet(sheetIndex);
    const colCount = sheet.getColumnCount();
    for (let i = 0; i < colCount; i++) {
      // ignore collapsed columns
      const cell = sheet.getCell(-1, i);
      const originalWidth = cell.width();
      if (originalWidth > 2) {
        sheet.autoFitColumn(i);
        cell.width(cell.width() + padding);
        cell.resizable(true);
      } else {
        cell.resizable(false);
      }
    }

    this.resume();
  }

  setCellRangeAttr(
    sheetIndex: number, row: number, col: number, rowCount: number, colCount: number, attr: string, value: any,
  ): void {
    this.getSheet(sheetIndex).getRange(row, col, rowCount, colCount)[attr](value);
  }

  getWorkbookData(): WorkbookData {
    return this.workbook.toJSON({
      includeBindingSource: true,
      ignoreStyle: false,
      ignoreFormula: false,
      rowHeadersAsFrozenColumns: false,
      columnHeadersAsFrozenRows: false,
    }) as WorkbookData;
  }

  getSheetData(sheetIndex): string {
    const sheet = this.getSheet(sheetIndex);
    const rowCount = sheet.getRowCount();
    const colCount = sheet.getColumnCount();
    return sheet.getCsv(0, 0, rowCount, colCount, '\r', ',');
  }

  getCellRangeFromSelection(sheetIndex: number, selection: GC.Spread.Sheets.Range) {
    const { row, col, rowCount, colCount } = selection;
    return this.getSheet(sheetIndex).getRange(row, col, rowCount, colCount);
  }

  getRange(row: number, col: number, rowCount: number, colCount: number) {
    return new _GC.Spread.Sheets.Range(row, col, rowCount, colCount);
  }

  evaluateFormula(sheet: GC.Spread.Sheets.Worksheet, formula: string) {
    return _GC.Spread.Sheets.CalcEngine.evaluateFormula(sheet, formula);
  }

  getSelectedRangeString(sheet: GC.Spread.Sheets.Worksheet, range: GC.Spread.Sheets.Range): string {
    let selectionInfo;
    const {
      rowCount, colCount, row, col,
    } = range;

    if (rowCount === 1 && colCount === 1) {
      selectionInfo = this.getCellPositionString(row + 1, col);
    } else if (rowCount < 0 && colCount > 0) {
      selectionInfo = `${colCount}C`;
    } else if (colCount < 0 && rowCount > 0) {
      selectionInfo = `${rowCount}R`;
    } else if (rowCount < 0 && colCount < 0) {
      selectionInfo = `${sheet.getRowCount()}R x ${sheet.getColumnCount()}C`;
    } else {
      selectionInfo = `${rowCount}R x ${colCount}C`;
    }
    return selectionInfo;
  }

  getCellPositionString(row: number, column: number): string {
    if (row < 1 || column < 1) {
      return '';
    }

    if (this.workbook.options.referenceStyle === _GC.Spread.Sheets.ReferenceStyle.a1) {
      return `${this.toAlphabetColumnName(column)}${row}`;
    }
    return `R${row}C${column}`;
  }

  bindSheetHeader(sheet: GC.Spread.Sheets.Worksheet) {
    const count = sheet.getColumnCount();
    this.suspend();
    for (let i = 0; i < count; i++) {
      sheet.setText(0, i, this.toAlphabetColumnName(i), _GC.Spread.Sheets.SheetArea.colHeader);
    }
    this.resume();
  }

  toAlphabetColumnName(x): string {
    let num = x + 1;
    let str = '';
    for (let a = 1, b = 26; (num -= a) >= 0; a = b, b *= 26) {
      str = String.fromCharCode(Number((num % b) / a) + 65) + str;
    }
    return str;
  }

  getSelections(sheetIndex?: number, type = SELECTION_TYPES.ALL): GCRange | GCRange[] {
    const selections = this.getSheet(sheetIndex).getSelections();
    if (selections.length > 0) {
      return type === SELECTION_TYPES.FIRST ? selections[0] :
        type === SELECTION_TYPES.LAST ? selections.pop() :
          selections;
    }

    return type === SELECTION_TYPES.ALL ? [] : null;
  }

  freezeRow(row: number) {
    this.getSheet().frozenRowCount(row);
  }

  freezeColumn(col: number) {
    this.getSheet().frozenColumnCount(col);
  }

  resetRowFreeze() {
    this.getSheet().frozenRowCount(1);
  }

  resetColFreeze() {
    this.getSheet().frozenColumnCount(1);
  }

  undo() {
    !this.isActiveSheetProtected && this.workbook.undoManager().undo();
  }

  redo() {
    !this.isActiveSheetProtected && this.workbook.undoManager().redo();
  }

  unfreeze() {
    !this.isActiveSheetProtected && this.resetColFreeze();
    !this.isActiveSheetProtected && this.resetRowFreeze();
  }

  clearCopyFormat() {
    this.setState({
      copiedFormat: null,
    });
  }

  async loadExcelFileBlob(fileBlob: Blob) {
    const jsonData = await this.getJsonFromBlob(fileBlob);
    this.workbook.fromJSON(jsonData);
    return jsonData;
  }

  getJsonFromBlob(blob: Blob) {
    const excelIO: GCExcel.IO = new this.GCExcel.IO();

    return new Promise((resolve, reject) => {
      excelIO.open(
        blob,
        (json) => {
          resolve(json);
        },
        (err) => {
          reject(err);
        },
      );
    });
  }

  handlePaintFormat() {
    if (!this.state.copiedFormat) {
      this.copyFormat();
    } else {
      this.clearCopyFormat();
    }
  }

  registerEvent(event, handler, spreadsheet = null) {
    this.workbook.bind(event, handler.handleEvent.bind(handler, spreadsheet || this));
  }

  registerCustomCommand(
    commandName: string, command: BaseCommand, spreadsheet: SpreadsheetWrapper = null,
    key: GC.Spread.Commands.Key = null, ctrl: boolean = false, shift: boolean = false, alt: boolean = false,
    meta: boolean = false,
  ) {
    const commands = _GC.Spread.Sheets.Commands;
    this.workbook.commandManager().register(commandName, {
      canUndo: true,
      canRedo: true,
      execute: (context, options, isUndo) => {
        if (isUndo) {
          commands.undoTransaction(context, options);
          if (command.hasUndo) {
            command.undoCommand(spreadsheet || this, options);
          }
          return true;
        }

        commands.startTransaction(context, options);
        command.runCommand(spreadsheet || this, options);
        commands.endTransaction(context, options);

        return true;
      },
    }, key, ctrl, shift, alt, meta);
  }

  setTextFormat(formatType: string) {
    const activeSheetIndex = this.getActiveSheetIndex();
    !this.isActiveSheetProtected && this.workbook.commandManager().execute({
      cmd: 'setTextFormat', sheetName: this.getSheet(activeSheetIndex).name(), activeSheetIndex, formatType,
    });
  }

  setHAlign(alignment: string) {
    const activeSheetIndex = this.workbook.getActiveSheetIndex();
    !this.isActiveSheetProtected && this.workbook.commandManager().execute({
      cmd: 'setHAlignCommand', sheetName: this.getSheet(activeSheetIndex).name(), activeSheetIndex, alignment,
    });
  }

  sort(ascending: boolean) {
    const activeSheetIndex = this.getActiveSheetIndex();
    !this.isActiveSheetProtected && this.workbook.commandManager().execute({
      cmd: 'sortCommand', sheetName: this.getSheet(activeSheetIndex).name(), activeSheetIndex, ascending,
    });
  }

  freeze() {
    const activeSheetIndex = this.getActiveSheetIndex();
    !this.isActiveSheetProtected && this.workbook.commandManager().execute({
      cmd: 'freezeCommand',
      sheetName: this.getSheet(activeSheetIndex).name(),
      activeSheetIndex,
    });
  }

  setFormat(format: string) {
    const activeSheetIndex = this.getActiveSheetIndex();
    const alignment = format === FORMATS.NUMBER ?
      _GC.Spread.Sheets.HorizontalAlign.right :
      _GC.Spread.Sheets.HorizontalAlign.left;

    !this.isActiveSheetProtected && this.workbook.commandManager().execute({
      cmd: 'setFormatCommand', sheetName: this.getSheet(activeSheetIndex).name(), activeSheetIndex, format,
      alignment,
    });
  }

  setColor(isForeColor: boolean, color: string) {
    const activeSheetIndex = this.getActiveSheetIndex();
    const selections = this.getSheet(activeSheetIndex).getSelections();
    !this.isActiveSheetProtected && this.workbook.commandManager().execute({
      cmd: 'setColorCommand',
      sheetName: this.getSheet(activeSheetIndex).name(),
      activeSheetIndex,
      selections,
      isForeColor,
      color,
    });
  }

  copyFormat() {
    if (!this.isActiveSheetProtected) {
      const { row, col } = this.getSelections(undefined, SELECTION_TYPES.FIRST) as GCRange;
      const copiedFormat = this.getSheet().getStyle(row, col) || new _GC.Spread.Sheets.Style();
      this.setState({
        copiedFormat,
      });
    }
  }

  pasteFormat() {
    if (this.state.copiedFormat) {
      const activeSheetIndex = this.getActiveSheetIndex();
      const selections = this.getSheet(activeSheetIndex).getSelections();
      !this.isActiveSheetProtected && this.workbook.commandManager().execute({
        cmd: 'pasteFormatCommand',
        sheetName: this.getSheet(activeSheetIndex).name(),
        activeSheetIndex,
        selections,
        copiedFormat: this.state.copiedFormat,
      });
      this.clearCopyFormat();
    }
  }

  setFilter() {
    const activeSheetIndex = this.getActiveSheetIndex();
    !this.isActiveSheetProtected &&
    this.workbook.commandManager().execute({
      cmd: 'setFilterCommand',
      sheetName: this.getSheet(activeSheetIndex).name(),
      activeSheetIndex,
    });
  }

  handleToolbarAction = (action: number, data: any) => {
    switch (action) {
      case ACTIONS.UNDO:
        this.undo();
        return;
      case ACTIONS.REDO:
        this.redo();
        return;
      case ACTIONS.ALIGN_LEFT:
        this.setHAlign('left');
        return;
      case ACTIONS.ALIGN_CENTER:
        this.setHAlign('center');
        return;
      case ACTIONS.ALIGN_RIGHT:
        this.setHAlign('right');
        return;
      case ACTIONS.FREEZE:
        this.freeze();
        return;
      case ACTIONS.UNFREEZE:
        this.unfreeze();
        return;
      case ACTIONS.SORT_ASCENDING:
        this.sort(true);
        return;
      case ACTIONS.SORT_DESCENDING:
        this.sort(false);
        return;
      case ACTIONS.TEXT_BOLD:
        this.setTextFormat('bold');
        return;
      case ACTIONS.TEXT_ITALIC:
        this.setTextFormat('italic');
        return;
      case ACTIONS.TEXT_UNDERLINE:
        this.setTextFormat('underline');
        return;
      case ACTIONS.FORMAT_CELL:
        const { format } = data;
        this.setFormat(format);
        return;
      case ACTIONS.FILL_CELL:
        this.setColor(false, data.color.hex);
        return;
      case ACTIONS.TEXT_COLOR:
        this.setColor(true, data.color.hex);
        return;
      case ACTIONS.PAINT_FORMAT:
        this.handlePaintFormat();
        return;
      case ACTIONS.FILTER:
        this.setFilter();
        return;
      default:
        console.error('Unknown action to handle');
    }
  };

  onRowColDeletion(isUndo: boolean, sheet: Worksheet, row: number, col: number, rowCount: number, colCount: number) {
    this.props.onRowColDeletion(isUndo, sheet, row, col, rowCount, colCount);
  }

  onRowColInsertion(isUndo: boolean, sheet: Worksheet, row: number, col: number, rowCount: number, colCount: number) {
    this.props.onRowColInsertion(isUndo, sheet, row, col, rowCount, colCount);
  }

  absoluteFormulaReference(sheet, row, col) {
    const { hasFormula } = sheet.getFormulaInformation(row, col);
    const cursorPosition = this.formulaBox.caret();
    const formulaExpression = this.formulaEl.current.value;
    const cellRefRegex = /[a-zA-Z]{1,2}(\d{1,3})/g;

    if (hasFormula && formulaExpression.charAt(0) === '=') {
      // TODO: this line caused to add downlevelIteration to tsconfig
      // See if we can get rid of it with some verbose code.
      const absoluteCellRef = [...formulaExpression.matchAll(cellRefRegex)];
      const cellAddress = absoluteCellRef.filter((_, i) => absoluteCellRef[i].index <= cursorPosition).pop();

      if (cellRefRegex.test(cellAddress[0])) {
        const newCellRef = this.addDollarToString(cellAddress[0]);
        const formula = this.replaceMatchedString(
          formulaExpression, cellAddress.index, cellAddress[0].length, newCellRef,
        );
        sheet.setFormula(row, col, formula);
        this.formulaBox.text(formula);
        sheet.setSelection(row, col, 1, 1);
      }
    }
  }

  addDollarToString(str) {
    const hasString = /[a-zA-Z]/g;
    let absoluteRef = '$';
    for (let i = 0; i < str.length; i++) {
      hasString.test(str[i]) ? absoluteRef += `${str[i]}$` : absoluteRef += str[i];
    }
    return absoluteRef;
  }

  replaceMatchedString(formulaExpression, cellAddress, stringLength, newCellRef) {
    const replaceFormulaExp = formulaExpression.split('');
    replaceFormulaExp.splice(cellAddress, stringLength);
    replaceFormulaExp.splice(cellAddress, 0, newCellRef);
    return replaceFormulaExp.join('');
  }

  handleDownloadXlsx = () => {
    const data = this.getWorkbookDataWithoutSheetProtection();
    const io = new _GCExcel.IO();
    io.save(data, (blob) => {
      saveAs(blob, this.props.downloadFileName);
    }, noopFunc);
  };

  getWorkbookDataWithoutSheetProtection() {
    const workbookData = this.getWorkbookData();
    const { sheets } = workbookData;
    Reflect.ownKeys(sheets).forEach((item) => sheets[item].isProtected = false);
    return workbookData;
  }

  render() {
    return (
      <FlexCol w="100%" h="100%" alignItems="stretch" className="spreadsheet-wrapper">
        <SpreadSheetToolbar
          customToolbarButtons={this.props.toolbarCustomButtons}
          customRightChild={this.props.toolbarCustomRightChild}
          onAction={this.handleToolbarAction}
          paintFormatActive={!!this.state.copiedFormat}
          showDownloadButton={true}
          showToolbar={this.props.showToolbar}
          onDownload={this.handleDownloadXlsx}
        />
        <Flex justify="flex-start" alignItems="center" borderY="1px" borderColor="gray.500" bg="gray.100">
          <Text
            w={32} flexShrink={0} textAlign="center" bg="gray.300" p={1} borderRight="1px"
            borderColor="gray.400" color="primary.600" fontWeight="bold" fontSize="xs"
          >
            {this.state.selectedCellRange}
          </Text>
          <InputGroup bg="gray.100" mx="1px">
            <InputLeftElement pointerEvents="none">
              <Icon as={FunctionIcon} fontSize={16} color="red.500"/>
            </InputLeftElement>
            <Input ref={this.formulaEl} borderWidth={0}/>
          </InputGroup>
        </Flex>
        <chakra.div flexGrow={1} ref={this.spreadEl}/>
      </FlexCol>
    );
  }

  mergeCells(sheetIndex, r, c, rc, cc) {
    const sheet = this.getSheet(sheetIndex);
    sheet.addSpan(r, c, rc, cc, _GC.Spread.Sheets.SheetArea.viewport);
  }

  setAutoMerge(
    sheetIndex: number,
    r: number, c: number, rc: number, cc: number,
    autoMergeDirection: number,
  ) {
    const range = new this.GC.Spread.Sheets.Range(r, c, rc, cc);
    const sheet = this.getSheet(sheetIndex);
    sheet.autoMerge(
      range,
      autoMergeDirection,
      this.GC.Spread.Sheets.AutoMerge.AutoMergeMode.restricted,
      this.GC.Spread.Sheets.SheetArea.viewport,
      this.GC.Spread.Sheets.AutoMerge.SelectionMode.merged,
    );
  }
}
