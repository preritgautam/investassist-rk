import React, { useMemo } from 'react';
import { RRSummaryData } from '../../../../../../../types';
import { chakra, Tab, TabList, TabPanels, Tabs } from '@chakra-ui/react';
import { TabPanel2 } from '../../../../../core/chakra/TabPanel2';
import { RentSummary, UnitSummary } from '../../../../../../services/document/RentRollDataService';
import { ColDef, RowClassParams, ValueFormatterParams } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-balham.css';
import { ValueGetterParams } from 'ag-grid-community/dist/lib/entities/colDef';
import { FlexCol } from '../../../../../../../bootstrap/chakra/components/layouts/FlexCol';
import { formatNumber } from '../../../../../../services/utils/utils';


function twoDec(params: ValueGetterParams) {
  return Number(params.data[params.colDef.field]).toFixed(2);
}

function fourDec(params: ValueGetterParams) {
  return Number(params.data[params.colDef.field]).toFixed(4);
}

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  currencySign: 'accounting',
});
const percentFormatter = new Intl.NumberFormat('en-US', { style: 'percent', minimumFractionDigits: 2 });

function currency({ value, node }: ValueFormatterParams) {
  if (node.isRowPinned() && isNaN(value)) {
    return '';
  }
  return currencyFormatter.format(value);
}

function percent({ value, node }: ValueFormatterParams) {
  if (node.isRowPinned() && isNaN(value)) {
    return 'NA';
  }

  if (isNaN(value)) {
    return 'NA';
  }

  return percentFormatter.format(value);
}

function numeric({ value, node }: ValueFormatterParams) {
  if (node.isRowPinned() && isNaN(value)) {
    return '';
  }
  return value === 'studio' ? value : formatNumber(value);
}

interface RentSummaryProps {
  rentSummary: RentSummary[];
  summaryColumnName: string;
  summaryRow: Partial<RentSummary>;
}

function RentSummary({ rentSummary, summaryColumnName, summaryRow }: RentSummaryProps) {
  const rowData = useMemo(() => rentSummary.sort(
    (s1, s2) => {
      if (isNaN(Number(s1.summaryKey)) || isNaN(Number(s2.summaryKey))) {
        return s1.summaryKey < s2.summaryKey ? -1 : 1;
      } else {
        return Number(s1.summaryKey) - Number(s2.summaryKey);
      }
    },
  ), [rentSummary]);

  const columnDefs: ColDef[] = useMemo(() => [
    { field: 'summaryKey', headerName: summaryColumnName, initialWidth: 120, pinned: 'left' },
    {
      headerName: 'All Units',
      headerClass: 'centerHeader',
      children: [
        {
          field: 'averageMarketRent',
          initialWidth: 130,
          headerName: 'Avg Market Rent',
          type: 'numericColumn',
          valueGetter: twoDec,
          valueFormatter: currency,
        },
      ],
    },
    {
      headerName: 'Occupied Units',
      headerClass: 'centerHeader',
      children: [
        {
          field: 'occupiedCount',
          initialWidth: 100,
          headerName: '# Occupied',
          type: 'numericColumn',
          valueFormatter: numeric,
        },
        {
          field: 'occupiedAverageMarketRent',
          initialWidth: 130,
          headerName: 'Avg Market Rent',
          type: 'numericColumn',
          valueGetter: twoDec,
          valueFormatter: currency,
        },
        {
          field: 'occupiedAverageInPlaceRent',
          initialWidth: 130,
          headerName: 'Avg In Place Rent',
          type: 'numericColumn',
          valueGetter: twoDec,
          valueFormatter: currency,
        },
        {
          field: 'occupiedInPlacePercentOfMarketRent',
          initialWidth: 130,
          headerName: '% of Market Rent',
          type: 'numericColumn',
          valueGetter: fourDec,
          valueFormatter: percent,
        },
      ],
    },

    {
      headerName: 'Recent 5',
      headerClass: 'centerHeader',
      children: [
        {
          field: 'recent5Count', headerName: '# Recent 5', type: 'numericColumn', initialWidth: 100,
          valueFormatter: numeric,
        },
        {
          field: 'recent5AverageInPlaceRent',
          initialWidth: 130,
          headerName: 'Avg In Place Rent',
          type: 'numericColumn',
          valueGetter: twoDec,
          valueFormatter: currency,
        },
      ],
    },

    {
      headerName: 'Last 90 Days Leases',
      headerClass: 'centerHeader',
      children: [
        {
          field: 'last90DaysCount', headerName: '#Leases', type: 'numericColumn', initialWidth: 100,
          valueFormatter: numeric,
        },
        {
          field: 'last90DaysAverageInPlaceRent',
          initialWidth: 130,
          headerName: 'Avg In Place Rent',
          type: 'numericColumn',
          valueGetter: twoDec,
          valueFormatter: currency,
        },
      ],
    },

    {
      headerName: 'Last 60 Days Leases',
      headerClass: 'centerHeader',
      children: [
        {
          field: 'last60DaysCount', headerName: '#Leases', type: 'numericColumn', initialWidth: 100,
          valueFormatter: numeric,
        },
        {
          field: 'last60DaysAverageInPlaceRent',
          initialWidth: 130,
          headerName: 'Avg In Place Rent',
          type: 'numericColumn',
          valueGetter: twoDec,
          valueFormatter: currency,
        },
      ],
    },

    {
      headerName: 'Last 30 Days Leases',
      headerClass: 'centerHeader',
      children: [
        {
          field: 'last30DaysCount',
          headerName: '# Leases',
          type: 'numericColumn',
          initialWidth: 100,
          valueFormatter: numeric,
        },
        {
          field: 'last30DaysAverageInPlaceRent',
          initialWidth: 130,
          headerName: 'Avg In Place Rent',
          type: 'numericColumn',
          valueGetter: twoDec,
          valueFormatter: currency,
        },
      ],
    },

  ], [summaryColumnName]);

  return (
    <chakra.div
      className="ag-theme-balham rr-rent-summary"
      h={76 + rentSummary.length * 29 + 29 + 15} w="full" flexShrink={0}
    >
      <AgGridReact
        rowData={rowData}
        columnDefs={columnDefs}
        suppressLoadingOverlay={true}
        suppressNoRowsOverlay={true}
        suppressMovableColumns={true}
        pinnedBottomRowData={[summaryRow]}
        suppressCellFocus={true}
        getRowStyle={(params: RowClassParams) => {
          if (params.node.isRowPinned()) {
            return { 'background-color': '#c8c8c8' };
          }
        }}
      />
    </chakra.div>
  );
}


interface UnitSummaryProps {
  unitSummary: UnitSummary[],
  summaryColumnName: string;
  summaryRow: Partial<UnitSummary>;
}

function UnitSummary({ unitSummary, summaryColumnName, summaryRow }: UnitSummaryProps) {
  const rowData = useMemo(() => unitSummary.sort(
    (s1, s2) => {
      if (isNaN(Number(s1.summaryKey)) || isNaN(Number(s2.summaryKey))) {
        return s1.summaryKey < s2.summaryKey ? -1 : 1;
      } else {
        return Number(s1.summaryKey) - Number(s2.summaryKey);
      }
    },
  ), [unitSummary]);

  const columnDefs: ColDef[] = useMemo(() => [
    {
      headerName: 'Unit Information',
      headerClass: 'centerHeader',
      children: [
        { field: 'summaryKey', headerName: summaryColumnName, initialWidth: 120, pinned: 'left' },
        { field: 'beds', headerName: 'Beds', initialWidth: 70, type: 'numericColumn', valueFormatter: numeric },
        { field: 'baths', headerName: 'Baths', initialWidth: 70, type: 'numericColumn', valueFormatter: numeric },
        { field: 'sqFt', headerName: 'Sq Ft', initialWidth: 90, type: 'numericColumn', valueFormatter: numeric },
        {
          field: 'unitCount',
          headerName: '# of Units',
          initialWidth: 90,
          type: 'numericColumn',
          valueFormatter: numeric,
        },
        {
          field: 'percentOfTotalUnits',
          headerName: '% of Total Units',
          initialWidth: 120,
          valueFormatter: percent,
          type: 'numericColumn',
        },
      ],
    },
    {
      headerName: 'Occupancy Status (% of units)',
      headerClass: 'centerHeader',
      children: [
        {
          field: 'percentOccupied',
          headerName: 'Occupied',
          valueFormatter: percent,
          type: 'numericColumn',
          initialWidth: 90,
        },
        {
          field: 'percentVacant',
          headerName: 'Vacant',
          valueFormatter: percent,
          type: 'numericColumn',
          initialWidth: 70,
        },
        {
          field: 'percentNonRevenue',
          headerName: 'Non-Revenue',
          valueFormatter: percent,
          type: 'numericColumn',
          initialWidth: 110,
        },
      ],
    },
    {
      headerName: 'Occupancy Status (# of units)',
      headerClass: 'centerHeader',
      children: [
        {
          field: 'countOccupied',
          headerName: 'Occupied',
          type: 'numericColumn',
          initialWidth: 90,
          valueFormatter: numeric,
        },
        {
          field: 'countVacant',
          headerName: 'Vacant',
          type: 'numericColumn',
          initialWidth: 70,
          valueFormatter: numeric,
        },
        {
          field: 'countNonRevenue',
          headerName: 'Non-Revenue',
          type: 'numericColumn',
          initialWidth: 110,
          valueFormatter: numeric,
        },
      ],
    },
    {
      headerName: 'Renovation Status',
      headerClass: 'centerHeader',
      children: [
        {
          field: 'countRenovated',
          headerName: 'Renovated',
          type: 'numericColumn',
          initialWidth: 90,
          valueFormatter: numeric,
        },
        {
          field: 'countDown',
          headerName: 'Down',
          type: 'numericColumn',
          initialWidth: 70,
          valueFormatter: numeric,
        },
        {
          field: 'countUnRenovated',
          headerName: 'Un-Renovated',
          type: 'numericColumn',
          initialWidth: 110,
          valueFormatter: numeric,
        },
      ],
    },
  ], [summaryColumnName]);

  return (
    <chakra.div
      className="ag-theme-balham rr-unit-summary" h={76 + unitSummary.length * 29 + 29 + 15} maxW="full" flexShrink={0}
    >
      <AgGridReact
        rowData={rowData}
        columnDefs={columnDefs}
        suppressLoadingOverlay={true}
        suppressNoRowsOverlay={true}
        suppressMovableColumns={true}
        suppressCellFocus={true}
        pinnedBottomRowData={[summaryRow]}
        getRowStyle={(params: RowClassParams) => {
          if (params.node.isRowPinned()) {
            return {
              'background-color': '#c8c8c8',
            };
          }
        }}
      />
    </chakra.div>
  );
}


export interface DocumentSummaryViewProps {
  summaryData: RRSummaryData;
}

export function DocumentSummaryView({ summaryData }: DocumentSummaryViewProps) {
  return (
    <Tabs display="flex" flexDirection="column" minH={0} overflow="auto" flexGrow={1} variant="solid-rounded" m={4}>
      <TabList>
        <Tab>Floor Plan</Tab>
        <Tab>Unit Type</Tab>
        <Tab>Unit Size</Tab>
        <Tab>Floor Plan Name</Tab>
      </TabList>

      <TabPanels display="flex" flexDirection="column" minH={0} overflow="auto" flexGrow={1}>
        <TabPanel2>
          <FlexCol mt={4} gap={4}>
            <RentSummary
              rentSummary={summaryData.fpRentSummary} summaryColumnName="Floor Plan"
              summaryRow={summaryData.fpRentSummarySummary}
            />
            <UnitSummary
              unitSummary={summaryData.fpUnitSummary} summaryColumnName="Floor Plan"
              summaryRow={summaryData.fpNameUnitSummarySummary}
            />
          </FlexCol>
        </TabPanel2>
        <TabPanel2>
          <FlexCol mt={4} gap={4}>
            <RentSummary
              rentSummary={summaryData.bedsRentSummary} summaryColumnName="Unit Type"
              summaryRow={summaryData.bedsRentSummarySummary}
            />
            <UnitSummary
              unitSummary={summaryData.bedsUnitSummary} summaryColumnName="Unit Type"
              summaryRow={summaryData.bedsUnitSummarySummary}
            />
          </FlexCol>
        </TabPanel2>
        <TabPanel2>
          <FlexCol mt={4} gap={4}>
            <RentSummary
              rentSummary={summaryData.sqFtRentSummary} summaryColumnName="Unit Area"
              summaryRow={summaryData.sqFtRentSummarySummary}
            />
            <UnitSummary
              unitSummary={summaryData.sqFtUnitSummary} summaryColumnName="Unit Area"
              summaryRow={summaryData.sqFtUnitSummarySummary}
            />
          </FlexCol>
        </TabPanel2>
        <TabPanel2>
          <FlexCol mt={4} gap={4}>
            <RentSummary
              rentSummary={summaryData.fpNameRentSummary} summaryColumnName="Floor Plan Name"
              summaryRow={summaryData.fpNameRentSummarySummary}
            />
            <UnitSummary
              unitSummary={summaryData.fpNameUnitSummary} summaryColumnName="Floor Plan Name"
              summaryRow={summaryData.fpNameUnitSummarySummary}
            />
          </FlexCol>
        </TabPanel2>
      </TabPanels>
    </Tabs>
  );
}
