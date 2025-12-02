import { Deal } from '../../../../types';
import React, { useCallback } from 'react';
import { FlexCol } from '../../../../bootstrap/chakra/components/layouts/FlexCol';
import {
  Box,
  ButtonProps,
  Flex,
  Heading,
  HStack,
  Icon,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Portal,
  Text,
} from '@chakra-ui/react';
import { CalendarIcon, DealStatusIcon2, DropDownIcon, EditIcon, LocationIcon, MoreVertIcon, OpenIcon } from '../icons';
import { AssignDealButton } from '../deal/used/AssignDealButton';
import { DateTime } from 'luxon';
import { LinkButton } from '../../../../bootstrap/chakra/components/core/LinkButton';
import { RoutingService, useRoutingService } from '../../../services/RoutingService';
import { DealStatusButton } from '../deal/used/DealStatusButton';
import { getDealStatusColor } from '../../../services/utils/utils';
import { ConfirmPopup } from '../../../../bootstrap/chakra/components/popups/ConfirmPopup';
import { useDealService } from '../../../services/account/user/DealService';
import { useSimpleToast } from '../../../hooks/utils/useSimpleToast';
import { Tooltip } from '../../core/Tooltip';
import { DealStatusBadge } from './DealStatusBadge';
import { useIsSampleDeal } from '../../../hooks/deal/useIsSampleDeal';
import { useIsFreeAccount } from '../../../hooks/deal/useIsFreeAccount';
import { useMixPanelService } from '../../../services/MixPanelService';

interface DealCardProps {
  deal: Deal;
  accountUsers: any[];
}

export const cardW = 360;
export const cardH = 200;

interface DealContextMenuProps extends ButtonProps {
  deal: Deal;
  onEdit: () => void;
  onDelete: () => void;
  isReadOnlyMode: boolean;
}

function DealContextMenu({ deal, onEdit, onDelete, isReadOnlyMode }: DealContextMenuProps) {
  return (
    <Menu>
      <MenuButton
        as={IconButton} size="sm" variant="ghost" rounded="full" colorScheme="secondary.500"
        icon={<Icon as={MoreVertIcon} fontSize={20} lineHeight={0}/>}
      />
      <Portal>
        <MenuList p={0} minW={32} rounded="none">
          <MenuItem fontSize="sm" onClick={onEdit}>Edit</MenuItem>
          <ConfirmPopup
            title={`Delete Deal ${deal.name}?`}
            message="Are you sure you want to delete this deal? This action can not be undone."
            onConfirm={onDelete}
            colorScheme="danger"
          >
            <MenuItem fontSize="sm" color="danger.500" isDisabled={isReadOnlyMode}>Delete</MenuItem>
          </ConfirmPopup>
        </MenuList>
      </Portal>
    </Menu>
  );
}


export function DealCard({ deal, accountUsers }: DealCardProps) {
  const isSampleDeal = useIsSampleDeal(deal);
  const color = getDealStatusColor(deal.status);
  const routing = useRoutingService();
  const gotoDealPage = useCallback(() => routing.gotoDealDocumentsPage(deal), [routing, deal]);
  const gotoDealDetailsPage = useCallback(() => routing.gotoDealDetailsPage(deal), [routing, deal]);

  const isFreeAccount = useIsFreeAccount();

  const isReadOnlyMode = isSampleDeal || isFreeAccount;

  const toast = useSimpleToast();

  const dealService = useDealService();
  const deleteDeal = dealService.useDeleteDeal();

  const mixPanelService = useMixPanelService();
  const handleDeleteDeal = useCallback(() => deleteDeal.mutateAsync(deal?.id, {
    onSuccess() {
      toast({
        title: 'Success!',
        description: `Deal '${deal?.name}' was successfully deleted.`,
      });
      mixPanelService.trackDealDeletedEvent(deal);
    },
  }), [deal, deleteDeal, toast, mixPanelService]);

  return (
    <FlexCol
      w={cardW} h={cardH} rounded="sm" boxShadow="_md" border="1px solid" borderColor={`${color}.50`} pb={4}
      justify="space-between"
    >
      <Flex position="relative" flexGrow={1}>
        <Flex align="flex-start" flexGrow={1} pt={4} cursor="pointer" onClick={gotoDealPage}>
          <DealStatusBadge status={deal.status}/>
          <FlexCol flexGrow={1} ml={4}>
            <LinkButton
              href={RoutingService.userDealPage(deal.slug)} underline={false}
              colorScheme="secondary.500"
              justifyContent="flex-start"
              sx={{ _hover: { textDecoration: 'none' } }}
              rightIcon={<Icon as={OpenIcon}/>}
            >
              <Tooltip label={deal.name} openDelay={1000}>
                <Heading size="sm" maxW={220} textOverflow="ellipsis" overflow="hidden">{deal.name}</Heading>
              </Tooltip>
            </LinkButton>
            <HStack mt={1}>
              <Icon as={LocationIcon} fontSize={10}/>
              <Text fontSize="xs" noOfLines={1}>{deal.address.line1}</Text>
            </HStack>
            <Text fontSize="xs" noOfLines={1} ml={4}>{deal.address.line2}</Text>
            <Text fontSize="xs" noOfLines={1} ml={4}>{deal.address.state}, {deal.address.city}</Text>
            <HStack mt={1}>
              <Icon as={CalendarIcon} fontSize={8}/>
              <Text fontSize="xs" noOfLines={1}>
                {DateTime.fromISO(deal.createdAt).toLocaleString(DateTime.DATE_SHORT)}
              </Text>
            </HStack>
          </FlexCol>
        </Flex>
        <Box position="absolute" right={4} top={4}>
          <DealContextMenu
            colorScheme={color} onEdit={gotoDealDetailsPage} onDelete={handleDeleteDeal} deal={deal}
            isReadOnlyMode={isReadOnlyMode}
          />
        </Box>
      </Flex>

      <Flex px={4} justify="space-between" align="center">
        <FlexCol align="flex-start">
          <Text fontSize="xs" color="text.500">Assigned To</Text>
          {!isSampleDeal && (
            <AssignDealButton
              deal={deal} accountUsers={accountUsers}
              size="xs" variant="flushed" icon={<Icon as={EditIcon} fontSize="xs" mt={1}/>}
              cursor="pointer" isDisabled={isReadOnlyMode}
            />
          )}
          {isSampleDeal && (
            <Text fontSize="xs" color="text.500">---</Text>
          )}
        </FlexCol>
        <FlexCol align="flex-start">
          <HStack mt={1}>
            <Icon as={DealStatusIcon2} fontSize={8} color={`${color}.500`}/>
            <Text fontSize="xs" color="text.500" ml={0}>Status</Text>
          </HStack>
          <DealStatusButton
            deal={deal}
            size="xs" variant="flushed" icon={<Icon as={DropDownIcon} fontSize={22} mt={1}/>}
            cursor="pointer" isDisabled={isReadOnlyMode}
          />
        </FlexCol>
      </Flex>
    </FlexCol>
  );

  // return (
  //   <FlexCol w={cardW} h={cardH} align="stretch" flexDir="column" bg="white" boxShadow="lg">
  //     <Flex p={2} justify="space-between" align="center">
  //       <Badge fontSize="xs">{deal.status}</Badge>
  //       <Button variant="ghost" colorScheme="secondary" size="sm"><Icon fontSize="lg" as={MoreVertIcon}/></Button>
  //     </Flex>
  //
  //     <Box
  //       cursor="pointer" sx={{ _hover: { bg: 'secondary.50' }, _active: { bg: 'secondary.100' } }} p={4}
  //       onClick={openDeal}
  //     >
  //       <VStack spacing={0}>
  //         <Heading size="sm" mb={1}>{deal.name}</Heading>
  //         <Text fontSize="sm" isTruncated maxW={56}>{deal.address.line1}</Text>
  //         <Text fontSize="sm">{deal.address.city}</Text>
  //         <Text fontSize="sm">{deal.address.state}</Text>
  //       </VStack>
  //     </Box>
  //
  //     <Divider mb={4}/>
  //
  //     <VStack>
  //       <VStack spacing={0}>
  //         <Text fontSize="xs" fontWeight={600}>Assigned To</Text>
  //         <AssignDealButton deal={deal} accountUsers={accountUsers}/>
  //       </VStack>
  //
  //       <VStack spacing={0}>
  //         <Text fontSize="xs" fontWeight={600}>Added On</Text>
  //         <Text fontSize="xs">{DateTime.fromISO(deal.createdAt).toLocaleString(DateTime.DATETIME_SHORT)}</Text>
  //       </VStack>
  //
  //       <VStack spacing={0}>
  //         <Text fontSize="xs" fontWeight={600}>Updated On</Text>
  //         <Text fontSize="xs">{DateTime.fromISO(deal.createdAt).toLocaleString(DateTime.DATETIME_SHORT)}</Text>
  //       </VStack>
  //     </VStack>
  //
  //     <Box flexGrow={1}/>
  //     <Button size="lg" rounded={0} boxShadow="0 0 8px 1px rgba(0, 0, 0, 0.1)" onClick={openDeal}>Open Deal</Button>
  //   </FlexCol>
  // );
}
