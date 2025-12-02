import React, { useCallback } from 'react';
import { AccountUser, Deal } from '../../../../../types';
import {
  Box, chakra, HStack, Icon, IconButton, Table, TableContainer, Tbody, Td, Text, Th, Thead, Tr, VStack,
} from '@chakra-ui/react';
import { CalendarIcon, DealStatusIcon2, DeleteIcon, EditIcon, LocationIcon, OpenIcon } from '../../icons';
import { getDealStatusColor } from '../../../../services/utils/utils';
import { DealStatusButton } from './DealStatusButton';
import { DateTime } from 'luxon';
import { RoutingService } from '../../../../services/RoutingService';
import { LinkButton, LinkIconButton } from '../../../../../bootstrap/chakra/components/core/LinkButton';
import { Tooltip } from '../../../core/Tooltip';
import { ConfirmPopup } from '../../../../../bootstrap/chakra/components/popups/ConfirmPopup';
import { useDealService } from '../../../../services/account/user/DealService';
import { useSimpleToast } from '../../../../hooks/utils/useSimpleToast';
import { AssignDealButton } from './AssignDealButton';
import { DealStatusBadge } from '../../deals/DealStatusBadge';
import { userSession } from '../../../../../userSession';
import { useIsFreeAccount } from '../../../../hooks/deal/useIsFreeAccount';
import { useMixPanelService } from '../../../../services/MixPanelService';

export interface DealTableProps {
  deals: Deal[],
  accountUsers: AccountUser[],
}


export function DealsTable({ deals, accountUsers }: DealTableProps) {
  const dealService = useDealService();
  const deleteDeal = dealService.useDeleteDeal();
  const toast = useSimpleToast();
  const { user } = userSession.useAuthManager();

  const isFreeAccount = useIsFreeAccount();

  const mixPanelService = useMixPanelService();

  const handleDeleteDeal = useCallback((deal) => deleteDeal.mutateAsync(deal.id, {
    onSuccess() {
      toast({
        title: 'Success!',
        description: `Deal '${deal.name}' was successfully deleted.`,
      });
      mixPanelService.trackDealDeletedEvent(deal);
    },
  }), [deleteDeal, toast, mixPanelService]);
  return (
    <Box as={TableContainer} minH={0} overflow="auto" rounded="sm" border="1px solid" borderColor="border.500">
      <Table size="md" colorScheme="gray">
        <Thead bg="gray.50">
          <Tr>
            <Th px={2}></Th>
            <Th py={6} pl={0}>Name</Th>
            <Th pl={0}>Location</Th>
            <Th pl={0}>Uploaded On</Th>
            <Th pl={0}>Assigned To</Th>
            <Th pl={0}>Status</Th>
            <Th pl={0}>Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {deals.map((deal) => {
            const isSampleDeal = user?.accountId !== deal?.accountId && deal?.isSampleDeal;
            const color = getDealStatusColor(deal.status);
            return (
              <Tr key={deal.id}>
                <Td px={2}>
                  <DealStatusBadge status={deal.status} fontSize={32} p="6px" mt={1} bordered={false}/>
                </Td>
                <Td pl={0} w={240}>
                  <Tooltip label={deal.name} openDelay={1000} shouldWrapChildren={true}>
                    <LinkButton
                      href={RoutingService.userDealPage(deal.slug)} underline={false}
                      colorScheme="secondary.500"
                      justifyContent="flex-start"
                      sx={{ _hover: { textDecoration: 'none' } }}
                      rightIcon={<Icon as={OpenIcon}/>}
                    >
                      <Text size="sm" fontWeight={500} maxW={200} overflow="hidden" textOverflow="ellipsis">
                        {deal.name}
                      </Text>
                    </LinkButton>
                  </Tooltip>
                </Td>
                <Td pl={0} w={240}>
                  <Tooltip
                    openDelay={1000}
                    label={(
                      <VStack align="flex-start" spacing={0}>
                        <HStack>
                          <Icon as={LocationIcon} fontSize={12}/>
                          <Text fontSize="sm">
                            {deal.address.line1}
                          </Text>
                        </HStack>
                        <Text fontSize="sm" pl={5}>
                          {deal.address.city}, {deal.address.state} - {deal.address.zipCode}
                        </Text>
                      </VStack>
                    )}
                  >
                    <VStack align="flex-start" spacing={0}>
                      <HStack>
                        <Icon as={LocationIcon} fontSize={12}/>
                        <Text fontSize="sm" maxW={220} overflow="hidden" textOverflow="ellipsis">
                          {deal.address.line1}
                        </Text>
                      </HStack>
                      <Text fontSize="sm" pl={5} maxW={220} overflow="hidden" textOverflow="ellipsis">
                        {deal.address.city}, {deal.address.state} - {deal.address.zipCode}
                      </Text>
                    </VStack>
                  </Tooltip>
                </Td>
                <Td pl={0}>
                  <HStack>
                    <Icon as={CalendarIcon} fontSize={12}/>
                    <Text fontSize="sm">{DateTime.fromISO(deal.createdAt).toLocaleString(DateTime.DATE_SHORT)}</Text>
                  </HStack>
                </Td>
                <Td pl={0}>
                  {!isSampleDeal && (
                    <AssignDealButton
                      deal={deal} accountUsers={accountUsers}
                      size="sm" variant="unstyled" icon={<Icon as={EditIcon} fontSize="sm" mt={1}/>}
                      cursor="pointer" isDisabled={isFreeAccount}
                    />
                  )}
                </Td>
                <Td pl={0}>
                  <HStack spacing={1}>
                    <Icon as={DealStatusIcon2} color={`${color}.500`} fontSize="sm"/>
                    <DealStatusButton
                      deal={deal}
                      size="xs" variant="filled" maxW={110}
                      isDisabled={isSampleDeal || isFreeAccount}
                    />
                  </HStack>
                </Td>
                <Td pl={0}>
                  <HStack justify="flex-start">
                    <Tooltip label="Edit Deal Details">
                      <chakra.span lineHeight={0}>
                        <LinkIconButton
                          variant="ghost" colorScheme="secondary" icon={<Icon as={EditIcon}/>}
                          aria-label="Edit deal"
                          href={RoutingService.userDealDetailsPage(deal.slug)}
                        />
                      </chakra.span>
                    </Tooltip>
                    <Tooltip label="Delete Deal">
                      <ConfirmPopup
                        title={`Delete Deal ${deal.name}?`}
                        message="Are you sure you want to delete this deal? This action can not be undone."
                        onConfirm={() => handleDeleteDeal(deal)}
                        colorScheme="danger"
                      >
                        <IconButton
                          variant="ghost" colorScheme="danger" icon={<Icon as={DeleteIcon}/>}
                          aria-label="Delete deal" isDisabled={isSampleDeal || isFreeAccount}
                        />
                      </ConfirmPopup>
                    </Tooltip>
                  </HStack>
                </Td>
              </Tr>
            );
          })}
        </Tbody>
      </Table>
    </Box>
  );
}
