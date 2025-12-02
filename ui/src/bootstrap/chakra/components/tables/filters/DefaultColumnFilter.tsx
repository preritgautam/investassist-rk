import React from 'react';
import { Input } from '@chakra-ui/react';

export interface DefaultColumnFilterProps {
  column: {
    filterValue: any,
    setFilter: (any) => void,
    preFilteredRows: any[],
  };
}

// Define a default UI for filtering
export function DefaultColumnFilter(
  { column: { filterValue, preFilteredRows, setFilter } }: DefaultColumnFilterProps,
) {
  const count = preFilteredRows.length;
  const [filterText, setFilterText] = React.useState(undefined);

  const handleChange = React.useCallback((e) => {
    setFilterText(e.target.value || undefined);
  }, []);

  React.useEffect(() => {
    if (filterValue !== filterText) {
      setFilter(filterText);
    }
  }, [filterValue, filterText, setFilter]);

  const handleClick = React.useCallback((e) => {
    e.stopPropagation();
  }, []);

  return (
    <Input
      size="xs"
      value={filterValue || ''}
      onChange={handleChange}
      onClick={handleClick}
      placeholder={`Search ${count} records...`}
    />
  );
}
