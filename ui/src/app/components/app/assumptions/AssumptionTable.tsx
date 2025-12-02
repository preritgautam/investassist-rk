import { Assumption } from '../../../../types';
import { RoutingService } from '../../../services/RoutingService';
import { Box, HStack, Icon, Table, TableContainer, Tbody, Td, Text, Th, Thead, Tr } from '@chakra-ui/react';
import { LinkButton } from '../../../../bootstrap/chakra/components/core/LinkButton';
import { OpenIcon } from '../icons';
import { DateTime } from 'luxon';
import { Tooltip } from '../../core/Tooltip';
import { DuplicateAssumptionIconButton } from './DuplicateAssumptionButtons';
import { DeleteAssumptionIconButton } from './DeleteAssumptionIconButton';
import React from 'react';

interface AssumptionRowProps {
  assumption: Assumption;
  editable: boolean;
}

function AssumptionRow({ assumption, editable }: AssumptionRowProps) {
  const url = editable ?
    RoutingService.editUserAssumptionPage(assumption.id) :
    RoutingService.viewAccountAssumptionPage(assumption.id);

  return (
    <Tr>
      <Td>
        <LinkButton href={url} rightIcon={<Icon as={OpenIcon}/>}>
          {assumption.name}
        </LinkButton>
      </Td>
      <Td>
        <Text fontSize="sm">
          {DateTime.fromISO(assumption.updatedAt).toLocaleString(DateTime.DATE_SHORT)}
        </Text>
      </Td>
      <Td>
        <HStack>
          <Tooltip label="Duplicate Assumptions">
            <DuplicateAssumptionIconButton
              variant="ghost" colorScheme="secondary" assumption={assumption} aria-label="Duplicate assumption"
            />
          </Tooltip>
          {editable && (
            <Tooltip label="Delete Assumption">
              <DeleteAssumptionIconButton
                assumption={assumption} colorScheme="danger" variant="ghost" aria-label="Delete Assumption"
              />
            </Tooltip>
          )}
        </HStack>
      </Td>
    </Tr>
  );
}

interface AssumptionsTableProps {
  assumptions: Assumption[];
  editable: boolean;
}

export function AssumptionTable({ assumptions, editable }: AssumptionsTableProps) {
  return (
    <Box as={TableContainer} minH={0} overflow="auto" rounded="sm" border="1px solid" borderColor="border.500">
      <Table colorScheme="gray" size="md">
        <Thead bg="gray.50">
          <Tr>
            <Th py={6}>Name</Th>
            <Th py={6}>Updated On</Th>
            <Th py={6}>Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {assumptions.map((a) => (
            <AssumptionRow key={a.id} assumption={a} editable={editable}/>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
}
