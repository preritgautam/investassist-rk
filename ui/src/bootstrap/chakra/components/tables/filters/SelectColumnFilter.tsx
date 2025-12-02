// This is a custom filter UI for selecting
// a unique option from a list
import React from 'react';
import { Select } from '@chakra-ui/react';

export interface SelectColumnFilterProps {
  column: {
    filterValue: any,
    setFilter: (any) => void,
    preFilteredRows: any[],
    id: any,
  };
  optionRender?: (x: string) => string,
}

const identity = (x: string) => x;

export function SelectColumnFilter(
  { column: { filterValue, setFilter, preFilteredRows = [], id }, optionRender = identity }: SelectColumnFilterProps,
) {
  // Calculate the options for filtering
  // using the preFilteredRows
  const options: any[] = React.useMemo(() => {
    const options = new Set();
    preFilteredRows.forEach((row) => {
      options.add(row.values[id]);
    });
    return Array.from(options);
  }, [id, preFilteredRows]);

  const stopClickPropagation = React.useCallback((e) => e.stopPropagation(), []);

  // Render a multi-select box
  return (
    <Select
      size="xs"
      value={filterValue}
      onChange={(e) => {
        setFilter(e.target.value || undefined);
      }}
      onClick={stopClickPropagation}
    >
      <option value="">All</option>
      {options.map((option, i) => (
        <option key={i} value={option}>
          {typeof option === 'boolean' ? option ? 'Yes' : 'No' : optionRender(option)}
        </option>
      ))}
    </Select>
  );
}
