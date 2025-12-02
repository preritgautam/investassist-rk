import React, { useCallback } from 'react';
import { Deal } from '../../../../../types';
import { AccountUser } from '../../../../../types';
import { useDealService } from '../../../../services/account/user/DealService';
import { Select, SelectProps, useToast } from '@chakra-ui/react';
import { BodyXS, HeadingXS } from '../../../../../bootstrap/chakra/components/typography';
import { useAccountService } from '../../../../services/account/user/AccountService';
import { noopArray } from '../../../../../bootstrap/utils/noop';

export interface AssignDealButtonProps extends SelectProps {
  deal: Deal;
  accountUsers: AccountUser[];
}

export function AssignDealButton({ deal, accountUsers, ...rest }: AssignDealButtonProps) {
  const dealService = useDealService();
  const { assignDealMutation } = dealService.useQueries();
  const toast = useToast();
  const handleChange = useCallback(async (e) => {
    const assignedToUser = accountUsers.find((user) => user.id === e.target.value);
    await assignDealMutation.mutateAsync({
      dealId: deal.id,
      assignedToUserId: assignedToUser.id,
    });
    toast({
      title: <HeadingXS>Success!</HeadingXS>,
      description: <BodyXS>Deal - {deal.name} has been assigned to {assignedToUser.name}.</BodyXS>,
      status: 'success',
      position: 'top',
      containerStyle: {
        borderRadius: 'xs',
      },
    });
  }, [deal, accountUsers, toast, assignDealMutation]);


  return (
    <>
      <Select onChange={handleChange} defaultValue={deal.assignedToUser.id} {...rest}>
        {accountUsers.map(({ name, id }, index) =>
          <option key={id} value={id}>{name}</option>)}
      </Select>
    </>
  );
}

export interface UseAssignDealButtonProps {
  deal: Deal;
  buttonProps: SelectProps;
}

export function useAssignDealButton({ deal, buttonProps }: UseAssignDealButtonProps) {
  const users = useAccountService().useQueries().useAccountUsers().data ?? noopArray;

  if (!deal) {
    return null;
  }

  return (
    <AssignDealButton deal={deal} accountUsers={users} {...buttonProps}/>
  );
}
