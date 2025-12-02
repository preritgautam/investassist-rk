import React from 'react';
import { Deal, DealDocument } from '../../../../../../../types';
import { RentSummary, UnitSummary } from '../../../../../../services/document/RentRollDataService';
import { SpreadSheets } from '../../../../../core/spreadjs/SpreadSheets';
import { useRentRollSummaryData } from '../../../../../../hooks/deal/document/UseRentRollSummaryData';

export interface DocumentReportViewProps {
  deal: Deal;
  document: DealDocument;
}


export interface DocumentReportSpreadsheetProps {
  fpRentSummary: RentSummary[];
  fpUnitSummary: UnitSummary[];
  bedsRentSummary: RentSummary[];
  bedsUnitSummary: UnitSummary[];
  fpNameRentSummary: RentSummary[];
  fpNameUnitSummary: UnitSummary[];
  sqFtRentSummary: RentSummary[];
  sqFtUnitSummary: UnitSummary[];
}

export class DocumentReportSpreadsheet extends React.Component<DocumentReportSpreadsheetProps, any> {
  private readonly sheetRef: React.RefObject<SpreadSheets>;

  constructor(props) {
    super(props);
    this.sheetRef = React.createRef<SpreadSheets>();
  }

  loadData() {
    const {
      fpRentSummary,
      fpUnitSummary,
      bedsRentSummary,
      bedsUnitSummary,
      fpNameRentSummary,
      fpNameUnitSummary,
      sqFtRentSummary,
      sqFtUnitSummary,
    } = this.props;

    this.loadRentSummary(0, fpRentSummary, 'Floor Plan');
    this.loadRentSummary(2, fpNameRentSummary, 'Floor Plan Name');
    this.loadRentSummary(4, bedsRentSummary, 'Unit Type');
    this.loadRentSummary(6, sqFtRentSummary, 'Unit Area');

    this.loadUnitSummary(1, fpUnitSummary, 'Floor Plan');
    this.loadUnitSummary(3, fpNameUnitSummary, 'Floor Plan Name');
    this.loadUnitSummary(5, bedsUnitSummary, 'Unit Type');
    this.loadUnitSummary(7, sqFtUnitSummary, 'Unit Area');
  }

  loadUnitSummary(sheetIndex: number, unitSummary: UnitSummary[], summaryColumnName: string) {
    const topHeaderRow = [
      'Unit Information',
      'Unit Information',
      'Unit Information',
      'Unit Information',
      'Unit Information',
      'Unit Information',
      'Occupancy Status (% of units)',
      'Occupancy Status (% of units)',
      'Occupancy Status (% of units)',
      'Occupancy Status (# of units)',
      'Occupancy Status (# of units)',
      'Occupancy Status (# of units)',
    ];

    const columnHeaders = [
      summaryColumnName,
      'Beds',
      'Baths',
      'Sq Ft',
      '# of Units',
      '% of Total Units',
      'Occupied',
      'Vacant',
      'Non-Revenue',
      'Occupied',
      'Vacant',
      'Non-Revenue',
    ];

    const dataRows = unitSummary.map((summary) => {
      return [
        summary.summaryKey,
        summary.beds,
        summary.baths,
        summary.sqFt,
        summary.unitCount,
        summary.percentOfTotalUnits,
        summary.percentOccupied,
        summary.percentVacant,
        summary.percentNonRevenue,
        summary.countOccupied,
        summary.countVacant,
        summary.countNonRevenue,
      ];
    });

    const dataSource = [
      topHeaderRow,
      columnHeaders,
      ...dataRows,
    ];

    const sheet = this.sheetRef.current.getSheet(sheetIndex);
    this.sheetRef.current.setSheetData(sheetIndex, dataSource);
    this.sheetRef.current.bindSheetHeader(sheet);
    this.sheetRef.current.autoFitColumns(sheetIndex, 10);
    sheet.getRange('A1:L1').setStyleName('topHeader');
    sheet.getRange('A2:L2').setStyleName('columnHeader');
    sheet.getRange(`A3:L${dataRows.length + 2}`).setStyleName('dataCells');

    sheet.getRange(`B3:D${dataRows.length + 2}`).formatter('0').hAlign(2);
    sheet.getRange(`E3:E${dataRows.length + 2}`).formatter('0').hAlign(2);
    sheet.getRange(`J3:L${dataRows.length + 2}`).formatter('0').hAlign(2);

    sheet.getRange(`F3:I${dataRows.length + 2}`).formatter('0.00%').hAlign(2);

    this.sheetRef.current.mergeCells(sheetIndex, 0, 0, 1, 6);
    this.sheetRef.current.mergeCells(sheetIndex, 0, 6, 1, 3);
    this.sheetRef.current.mergeCells(sheetIndex, 0, 9, 1, 3);
  }

  loadRentSummary(sheetIndex: number, rentSummary: RentSummary[], summaryColumnName: string) {
    const topHeaderRow = [
      'Unit Information',
      'All Units',
      'Currently Occupied Units',
      'Currently Occupied Units',
      'Currently Occupied Units',
      'Recent leases',
      'Recent leases',
      'Recent leases',
      'Recent leases',
      'Recent leases',
      'Recent leases',
      'Recent leases',
      'Recent leases',
    ];
    const columnHeaders = [
      summaryColumnName,
      'Avg Market Rent',
      'Avg Market Rent',
      'Avg In Place Rent',
      '% of Market Rent',
      '# Recent 5',
      'Avg. In Place Rent (R5)',
      '# Leases Last 90 Days',
      'Avg. In Place Rent (90 Days)',
      '# Leases Last 60 Days',
      'Avg. In Place Rent (60 Days)',
      '# Leases Last 30 Days',
      'Avg. In Place Rent (30 Days)',
    ];
    const dataRows = rentSummary.map((summary: RentSummary) => [
      summary.summaryKey,
      summary.averageMarketRent,
      summary.occupiedAverageMarketRent,
      summary.occupiedAverageInPlaceRent,
      summary.occupiedInPlacePercentOfMarketRent,
      summary.recent5Count,
      summary.recent5AverageInPlaceRent,
      summary.last90DaysCount,
      summary.last90DaysAverageInPlaceRent,
      summary.last60DaysCount,
      summary.last60DaysAverageInPlaceRent,
      summary.last30DaysCount,
      summary.last30DaysAverageInPlaceRent,
    ]);

    const dataSource = [
      topHeaderRow,
      columnHeaders,
      ...dataRows,
    ];


    const sheet = this.sheetRef.current.getSheet(sheetIndex);
    this.sheetRef.current.setSheetData(sheetIndex, dataSource);
    this.sheetRef.current.bindSheetHeader(sheet);
    this.sheetRef.current.autoFitColumns(sheetIndex, 10);
    sheet.getRange('A1:M1').setStyleName('topHeader');
    sheet.getRange('A2:M2').setStyleName('columnHeader');
    sheet.getRange(`A3:M${dataRows.length + 2}`).setStyleName('dataCells');

    sheet.getRange(`B3:D${dataRows.length + 2}`).formatter('$#,##0.00').hAlign(2);
    sheet.getRange(`G3:G${dataRows.length + 2}`).formatter('$#,##0.00').hAlign(2);
    sheet.getRange(`I3:I${dataRows.length + 2}`).formatter('$#,##0.00').hAlign(2);
    sheet.getRange(`K3:K${dataRows.length + 2}`).formatter('$#,##0.00').hAlign(2);
    sheet.getRange(`M3:M${dataRows.length + 2}`).formatter('$#,##0.00').hAlign(2);

    sheet.getRange(`E3:E${dataRows.length + 2}`).formatter('0.00%').hAlign(2);

    sheet.getRange(`F3:F${dataRows.length + 2}`).formatter('0').hAlign(2);
    sheet.getRange(`H3:H${dataRows.length + 2}`).formatter('0').hAlign(2);
    sheet.getRange(`J3:J${dataRows.length + 2}`).formatter('0').hAlign(2);
    sheet.getRange(`L3:L${dataRows.length + 2}`).formatter('0').hAlign(2);

    this.sheetRef.current.mergeCells(sheetIndex, 0, 2, 1, 3);
    this.sheetRef.current.mergeCells(sheetIndex, 0, 5, 1, 8);
  }

  onSpreadsheetLoad = () => {
    this.sheetRef.current.setSheetName(0, 'Floor Plan Rent Summary');
    this.sheetRef.current.setSheetName(1, 'Floor Plan Units Summary');
    this.sheetRef.current.setSheetName(2, 'Floor Plan Name Rent Summary');
    this.sheetRef.current.setSheetName(3, 'Floor Plan Name Units Summary');
    this.sheetRef.current.setSheetName(4, 'Unit Type Rent Summary');
    this.sheetRef.current.setSheetName(5, 'Unit Type Units Summary');
    this.sheetRef.current.setSheetName(6, 'Sq Ft Rent Summary');
    this.sheetRef.current.setSheetName(7, 'Sq Ft Units Summary');

    this.sheetRef.current.addStyle(
      null,
      'topHeader',
      {
        backColor: '#77f',
        foreColor: '#fff',
        borderLeft: {
          color: '#000',
          lineStyle: 'medium',
        },
        borderRight: {
          color: '#000',
          lineStyle: 'medium',
        },
        borderBottom: {
          color: '#000',
          lineStyle: 'medium',
        },
        borderTop: {
          color: '#000',
          lineStyle: 'medium',
        },
        hAlign: 1,
        vAlign: true,
      });

    this.sheetRef.current.addStyle(
      null,
      'columnHeader',
      {
        backColor: '#ff9',
        foreColor: '#333',
        borderLeft: {
          color: '#000',
          lineStyle: 'medium',
        },
        borderRight: {
          color: '#000',
          lineStyle: 'medium',
        },
        borderBottom: {
          color: '#000',
          lineStyle: 'medium',
        },
        borderTop: {
          color: '#000',
          lineStyle: 'medium',
        },
        hAlign: 1,
        vAlign: true,
      });

    this.sheetRef.current.addStyle(
      null,
      'dataCells',
      {
        backColor: '#fff',
        foreColor: '#000',
        borderLeft: {
          color: '#000',
          lineStyle: 'thin',
        },
        borderRight: {
          color: '#000',
          lineStyle: 'thin',
        },
        borderBottom: {
          color: '#000',
          lineStyle: 'thin',
        },
        borderTop: {
          color: '#000',
          lineStyle: 'thin',
        },
        hAlign: 1,
        vAlign: true,
      });

    this.loadData();
  };

  render() {
    return (
      <SpreadSheets onReady={this.onSpreadsheetLoad} sheetCount={8} ref={this.sheetRef}/>
    );
  }
}


export function DocumentReportView({ deal, document }: DocumentReportViewProps) {
  const { summaries: summaryData } = useRentRollSummaryData(deal, document);

  return (
    <DocumentReportSpreadsheet {...summaryData} />
  );
}
