import { useAccountService } from '../../../../services/account/user/AccountService';
import React, { useCallback } from 'react';
import { ConfirmPopup } from '../../../../../bootstrap/chakra/components/popups/ConfirmPopup';
import { PlanMap } from '../../../../constant/PlanMap';
import { Button, ButtonProps } from '@chakra-ui/react';
import { Account } from '../../../../../types';

interface UpgradeAccountButtonProps extends ButtonProps {
  account: Account;
  onDone: () => void;
}

export function UpgradeAccountButton({ account, onDone, ...rest }: UpgradeAccountButtonProps) {
  const upgradeMutation = useAccountService().useUpgradeAccountFromTrialToPaidMutation();

  const upgradeAccount = useCallback(async () => {
    await upgradeMutation.mutateAsync();
    onDone?.();
  }, [upgradeMutation, onDone]);

  return (
    <ConfirmPopup
      title="Upgrade Account Now?"
      message={
        `You will be immediately charged and your account will be upgraded to InvestAssist ${PlanMap[account.planId]} `
      }
      onConfirm={upgradeAccount}
    >
      <Button {...rest} isLoading={upgradeMutation.isLoading}/>
    </ConfirmPopup>
  );
}
