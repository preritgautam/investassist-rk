import { useAccountService } from '../../../../services/account/user/AccountService';
import React, { useCallback } from 'react';
import { ConfirmPopup } from '../../../../../bootstrap/chakra/components/popups/ConfirmPopup';
import { Button, ButtonProps } from '@chakra-ui/react';

interface CancelSubscriptionButtonProps extends ButtonProps {
  onDone: () => void;
  message: string;
}

export function CancelSubscriptionButton({ onDone, message, ...rest }: CancelSubscriptionButtonProps) {
  const cancelMutation = useAccountService().useCancelAccountSubscriptionMutation();
  const handleCancel = useCallback(async () => {
    await cancelMutation.mutateAsync();
    // Let's wait a couple of seconds to ensure webhooks are triggered
    setTimeout(() => onDone?.(), 2000);
  }, [cancelMutation, onDone]);

  return (
    <ConfirmPopup
      title="Cancel Subscription?"
      message={message}
      onConfirm={handleCancel}
      colorScheme="danger"
    >
      <Button {...rest} isLoading={cancelMutation.isLoading}/>
    </ConfirmPopup>
  );
}
