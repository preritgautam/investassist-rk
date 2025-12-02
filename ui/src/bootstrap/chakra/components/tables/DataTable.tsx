import { Button, Flex, Box, TableProps } from '@chakra-ui/react';
import React from 'react';
import { Paper, PaperProps } from '../containers/Paper';
import { RefreshIcon } from '../icons';
import { HeadingS } from '../typography';
import { DTColumn, SimpleDataTable } from './SimpleDataTable';

export interface DataTableProps extends PaperProps {
  title?: string,
  columns?: DTColumn[],
  data?: {}[],
  onRefresh?: () => void,
  loading?: boolean,
  rightControls?: React.ReactNode,
  size?: TableProps['size'],
}

export function DataTable(
  {
    title = '',
    columns = [], data = [],
    onRefresh, loading = false,
    rightControls = null,
    size,
    ...rest
  }: DataTableProps) {
  // @ts-ignore
  return (
    <Paper variant="hoverable" display="flex" flexDir="column" p={4} {...rest}>
      <Flex justify="space-between" align="center">
        <Flex align="center" mb={4}>
          {title && <HeadingS color="primary.500" mr={4}>{title}</HeadingS>}
          {onRefresh && (
            <Button
              size="xs" onClick={onRefresh} disabled={loading}
              leftIcon={<RefreshIcon size={16}/>} colorScheme="secondary"
            >
              Refresh
            </Button>
          )}
        </Flex>
        {rightControls}
      </Flex>

      <Box minH={0} overflow="auto">
        <SimpleDataTable data={data} columns={columns} size={size}/>
      </Box>
    </Paper>
  );
}
