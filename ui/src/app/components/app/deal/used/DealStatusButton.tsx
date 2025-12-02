import { Select, SelectProps } from '@chakra-ui/react';
import { Deal } from '../../../../../types';
import { useDealService } from '../../../../services/account/user/DealService';
import { useSimpleToast } from '../../../../hooks/utils/useSimpleToast';
import React, { useCallback } from 'react';
import { DealStatusEnum } from '../../../../enums/DealStatusEnum';

interface DealStatusButtonProps extends SelectProps {
  deal: Deal,
}

export function DealStatusButton({ deal, ...rest }: DealStatusButtonProps) {
  const { updateDealMutation } = useDealService().useQueries();
  const toast = useSimpleToast();
  const handleStatusChange = useCallback(async (e) => {
    const newStatus = e.target.value;
    await updateDealMutation.mutateAsync({
      id: deal.id,
      status: newStatus,
    }, {
      onSuccess: () => toast({
        title: 'Status Updated',
        description: `Deal status changed to ${newStatus}`,
      }),
    });
  }, [deal.id, updateDealMutation, toast]);

  return (
    <Select variant="unstyled" value={deal.status} onChange={handleStatusChange} {...rest}>
      <option>{DealStatusEnum.NEW.key}</option>
      <option>{DealStatusEnum.IN_PROGRESS.key}</option>
      <option>{DealStatusEnum.COMPLETED.key}</option>
    </Select>
  );
}
