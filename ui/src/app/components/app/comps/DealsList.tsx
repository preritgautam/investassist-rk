import React from 'react';
import { FlexCol } from '../../../../bootstrap/chakra/components/layouts/FlexCol';
import { Deal } from '../../../../types';
import { Box, Checkbox, Flex, Icon, Table, TableContainer, Tbody, Td, Text, Th, Thead, Tr } from '@chakra-ui/react';
import { DateTime } from 'luxon';
import { Tooltip } from '../../core/Tooltip';
import { DealStatusIcon2 } from '../icons';
import { getDealStatusColor } from '../../../services/utils/utils';


export interface DealsListProps {
  deals?: Deal[];
  onAddDeal: (deal: Deal) => void;
  onRemoveDeal: (deal: Deal) => void;
  selectedDeals: Set<Deal>;
}

export function DealsList({ deals, onAddDeal, onRemoveDeal, selectedDeals }: DealsListProps) {
  return (
    <FlexCol minH={0} overflow="auto">
      {deals && (
        <Box as={TableContainer} minH={0} overflow="auto" borderColor="border.500" borderWidth="1px">
          <Table>
            <Thead bg="gray.50">
              <Tr>
                <Th py={6} borderColor="border.500"/>
                <Th maxW={48} borderColor="border.500">Deal</Th>
                <Th borderColor="border.500">Created On</Th>
                <Th borderColor="border.500">Status</Th>
                <Th borderColor="border.500">City</Th>
                <Th borderColor="border.500">Zip</Th>
                <Th borderColor="border.500"># Units</Th>
                <Th borderColor="border.500">Building Type</Th>
                <Th borderColor="border.500">Year Built</Th>
                <Th borderColor="border.500">Year Renovated</Th>
              </Tr>
            </Thead>
            <Tbody>
              {deals.map((deal: Deal) => {
                const color = getDealStatusColor(deal.status);
                return (
                  <Tr key={deal.id}>
                    <Td borderColor="border.500" verticalAlign="top">
                      <Checkbox
                        isChecked={selectedDeals.has(deal)}
                        onChange={(e) => e.target.checked ? onAddDeal(deal) : onRemoveDeal(deal)}
                      />
                    </Td>
                    <Td maxW={48} borderColor="border.500">
                      <Tooltip label={deal.name}>
                        <Text
                          fontWeight="bold"
                          maxW={48} overflow="hidden" textOverflow="ellipsis"
                        >{deal.name}</Text>
                      </Tooltip>
                      <Text
                        fontSize="xs" maxW={48} overflow="hidden" textOverflow="ellipsis"
                      >{deal.address.line1},</Text>
                      {deal.address.line2 && (
                        <Text fontSize="xs" maxW={48} overflow="hidden" textOverflow="ellipsis">
                          {deal.address.line2},
                        </Text>
                      )}
                      <Text fontSize="xs">{deal.address.city}, {deal.address.state}</Text>
                    </Td>
                    <Td borderColor="border.500">
                      <Text fontSize="sm">{DateTime.fromISO(deal.createdAt).toLocaleString(DateTime.DATE_SHORT)}</Text>
                    </Td>
                    <Td borderColor="border.500">
                      <Flex gap={1}>
                        <Icon as={DealStatusIcon2} color={`${color}.500`} fontSize="sm"/>
                        <Text fontSize="sm">{deal.status}</Text>
                      </Flex>
                    </Td>
                    <Td borderColor="border.500">
                      <Text fontSize="sm">{deal.address.city}</Text>
                    </Td>
                    <Td borderColor="border.500">
                      <Text fontSize="sm">{deal.address.zipCode}</Text>
                    </Td>
                    <Td borderColor="border.500">
                      <Text fontSize="sm">{deal.details?.numUnits}</Text>
                    </Td>
                    <Td borderColor="border.500">
                      <Text fontSize="sm">{deal.details?.buildingType}</Text>
                    </Td>
                    <Td borderColor="border.500">
                      <Text fontSize="sm">{deal.details?.dateBuilt}</Text>
                    </Td>
                    <Td borderColor="border.500">
                      <Text fontSize="sm">{deal.details?.dateRenovated}</Text>
                    </Td>
                  </Tr>
                );
              })}
            </Tbody>
          </Table>
        </Box>
      )
      }
    </FlexCol>
  );
}
