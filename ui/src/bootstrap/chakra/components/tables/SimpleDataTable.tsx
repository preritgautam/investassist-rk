import {
  Table,
  Thead,
  Tr,
  Th,
  Td,
  Tbody,
  Box,
  TableProps,
  Text,
  Heading,
  TableCellProps, TableColumnHeaderProps,
} from '@chakra-ui/react';
import React from 'react';
import { useTable, useSortBy, useFilters, Column, UseFiltersColumnOptions, UseSortByColumnOptions } from 'react-table';

export type DTColumn = UseFiltersColumnOptions<{}> & UseSortByColumnOptions<{}> & Column & {
  header?: string,
  thProps?: TableColumnHeaderProps,
  tdProps?: TableCellProps,
};

export interface SimpleDataTableProps extends TableProps {
  columns?: DTColumn[],
  data?: {}[],
}

export function SimpleDataTable(
  {
    columns = [],
    data = [],
    size = 'sm',
    fontSize = 'sm',
    ...rest
  }: SimpleDataTableProps,
) {
  const tableInstance = useTable(
    {
      columns,
      data,
      defaultColumn: {
        // eslint-disable-next-line react/prop-types
        Header: ({ column }: { column: DTColumn }) => <Heading fontSize={fontSize}>{column.header}</Heading>,
        // eslint-disable-next-line react/prop-types
        Cell: ({ value }) => <Text fontSize={fontSize}>{value}</Text>,
      },
    },
    useFilters, useSortBy,
  );
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = tableInstance;

  // @ts-ignore
  return (
    <Table {...getTableProps()} variant="striped" colorScheme="gray" size={size} {...rest}>
      <Thead mb={8}>
        {// Loop over the header rows
          headerGroups.map((headerGroup) => (
            // Apply the header row props
            // eslint-disable-next-line react/jsx-key
            <Tr {...headerGroup.getHeaderGroupProps()}>
              {// Loop over the headers in each row
                headerGroup.headers.map((column) => (
                  // Apply the header cell props
                  // @ts-ignore
                  // eslint-disable-next-line react/jsx-key
                  <Th {...column.getHeaderProps(column.getSortByToggleProps())} verticalAlign="top" px={0}>
                    {// Render the header
                      column.render('Header')
                    }
                    <span>
                      {/* @ts-ignore */}
                      {column.isSorted ? (column.isSortedDesc ? ' ↓' : ' ↑') : ' ' /* ↕ */}
                    </span>
                    {/* @ts-ignore */}
                    {column.canFilter ? <Box mt={2}>{column.render('Filter')}</Box> : null}
                  </Th>
                ))}
            </Tr>
          ))}
      </Thead>
      {/* Apply the table body props */}
      <Tbody {...getTableBodyProps()}>
        {// Loop over the table rows
          rows.map((row) => {
            // Prepare the row for display
            prepareRow(row);
            return (
              // Apply the row props
              // eslint-disable-next-line react/jsx-key
              <Tr {...row.getRowProps()}>
                {// Loop over the rows cells
                  row.cells.map((cell) => {
                    // Apply the cell props
                    return (
                      // eslint-disable-next-line react/jsx-key
                      <Td {...cell.getCellProps()} className="align-middle">
                        {// Render the cell contents
                          cell.render('Cell')}
                      </Td>
                    );
                  })}
              </Tr>
            );
          })}
      </Tbody>
    </Table>
  );
}
