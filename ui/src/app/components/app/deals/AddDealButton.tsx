import { Button, ButtonProps, useDisclosure } from '@chakra-ui/react';
import { AddDealFormModal } from '../modals/AddDealFormModal';
import React, { ReactNode } from 'react';
import { useIsFreeAccount } from '../../../hooks/deal/useIsFreeAccount';

export interface AddDealButtonProps extends ButtonProps {
  children?: ReactNode
}

export function AddDealButton({ children, ...rest }: AddDealButtonProps) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const isFreeAccount = useIsFreeAccount();

  return (
    <>
      <Button {...rest} onClick={onOpen} colorScheme="primary" disabled={isFreeAccount}>
        {children ?? 'Add Deal'}
      </Button>
      <AddDealFormModal isOpen={isOpen} onClose={onClose} title="Add Deal"/>
    </>
  );
}
