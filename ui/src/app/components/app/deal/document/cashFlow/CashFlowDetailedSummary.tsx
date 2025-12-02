import { useToggle } from '../../../../../../bootstrap/hooks/utils/useToggle';
import { FlexCol, FlexColProps } from '../../../../../../bootstrap/chakra/components/layouts/FlexCol';
import { Button, Divider, Flex, HStack, Icon, IconButton, Select, Text } from '@chakra-ui/react';
import React, { useMemo } from 'react';
import { CFDataColumn, ExtractedData } from '../../../../../../types';
import { useCashFlowDataService } from '../../../../../services/document/CashFlowDataService';
import { useSummarizableColumns } from '../../../../../hooks/deal/document/cashFlow/useSummarizableColumns';
import { MenuDownIcon, MenuRightIcon } from '../../../icons';
import { formatAmount } from '../../../../../services/utils/utils';

interface SummaryGroupProps {
  data: {
    total: number;
    categories: Record<string, number>;
  };
  label: string;
  group: string | 'income' | 'expense' | 'capEx' | 'totalSummary';
}

const summaryMeta = {
  income: { label: 'Income', color: 'blue', sort: true, defaultExpanded: false },
  expense: { label: 'Expense', color: 'red', sort: true, defaultExpanded: false },
  capEx: { label: 'Capital Expense', color: 'yellow', sort: true, defaultExpanded: false },
  totalSummary: { label: 'Summary', color: 'gray', sort: false, defaultExpanded: true },
};

function SummaryGroup({ data, label, group }: SummaryGroupProps) {
  const [expanded, toggleExpanded] = useToggle(summaryMeta[group].defaultExpanded);
  const categoryList = Reflect.ownKeys(data.categories);
  if (summaryMeta[group].sort) {
    categoryList.sort();
  }
  return (
    <FlexCol noScroll border="1px solid" borderColor="border.500" rounded="sm">
      <Flex
        justify="space-between" bg={`${summaryMeta[group].color}.50`} pr={2} py={1}
        borderBottom={expanded ? '1px solid' : 'none'} borderColor="border.500"
        align="center"
      >
        <HStack>
          <IconButton
            aria-label={`Toggle ${label} summary`} onClick={toggleExpanded} variant="ghost" size="xs"
            icon={<Icon as={expanded ? MenuDownIcon : MenuRightIcon}/>}
            colorScheme={summaryMeta[group].color}
          />
          <Text fontSize="sm" fontWeight="bold">{label}</Text>
        </HStack>
        {data.total >= 0 && (
          <Text fontSize="sm" color={`${summaryMeta[group].color}.500`} fontWeight="medium">
            {formatAmount(data.total)}
          </Text>
        )}
      </Flex>
      {expanded && categoryList.map((cat: string, i) => (
        <React.Fragment key={cat as string}>
          {i > 0 && (
            <Divider/>
          )}
          <Flex key={cat as string} px={2} justify="space-between" my={1}>
            <Text fontSize="sm">{cat}</Text>
            <Text fontSize="sm">{formatAmount(data.categories[cat as string])}</Text>
          </Flex>
        </React.Fragment>
      ))}
    </FlexCol>
  );
}

const MonthNames = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function columnLabel(column: CFDataColumn) {
  const [year, month] = column.periodEndDate.split('-').map((x) => parseInt(x));
  let colName = '';
  if (column.period === 'yearly') {
    colName = `Year ${year}`;
  } else if (column.period === 'monthly') {
    colName = `${MonthNames[month]} ${year}`;
  } else if (column.period === 'quarterly') {
    colName = `Q${Math.ceil(month / 3)} ${year}`;
  } else if (column.period === 'ytd') {
    colName = `YTD ${year}`;
  } else if (column.period === 'ttm') {
    colName = `${MonthNames[month]} ${year} TTM`;
  }

  if (!['actual', 'actual-total'].includes(column.type)) {
    colName += ' Others';
  } else if (column.type === 'actual-total') {
    colName = `Total ${year} `;
  }

  return colName;
}

interface CashFlowDetailedSummaryProps extends FlexColProps {
  data: ExtractedData;
  onToggleView: () => void;
}

export function CashFlowDetailedSummary({ data, onToggleView, ...rest }: CashFlowDetailedSummaryProps) {
  const cashFlowDataService = useCashFlowDataService();
  const [summarizableColumns, summaryColumn, setSummaryColumn] = useSummarizableColumns(data);

  const summary = useMemo(
    () => cashFlowDataService.getDetailedSummary(data, summaryColumn),
    [data, summaryColumn, cashFlowDataService],
  );

  return (
    <FlexCol pr={4} pb={4} {...rest}>
      <Select
        my={1} onChange={(e) => setSummaryColumn(e.target.value)}
        defaultValue={summaryColumn}
      >
        {summarizableColumns.map((column: CFDataColumn) => (
          <option key={column.key} value={column.key}>{columnLabel(column)}</option>
        ))}
      </Select>
      <FlexCol flexGrow={1} my={4} gap={4}>
        {Reflect.ownKeys(summary).filter((g) => g !== 'noi').map((group) => (
          <SummaryGroup
            key={group as string} data={summary[group]} label={summaryMeta[group as string].label}
            group={group as string}
          />
        ))}
      </FlexCol>
      <Divider alignSelf="stretch" my={2}/>
      <Button onClick={onToggleView} flexGrow={0} flexShrink={0} alignSelf="flex-end" minW={24}>
        Close
      </Button>
    </FlexCol>
  );
}
