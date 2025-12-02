import React from 'react';
import { useAddDealAddressPopup } from '../deal/used/AddDealAddressPopup';
import { Icon, IconButton, IconButtonProps } from '@chakra-ui/react';
import { EditIcon } from '../icons';
import { Deal } from '../../../../types';

interface AddDealAddressButtonProps extends Omit<IconButtonProps, 'aria-label'> {
  deal: Deal,
}

export function AddDealAddressButton({ deal, ...rest }: AddDealAddressButtonProps) {
  const [addAddressPopup, show, isChanging] = useAddDealAddressPopup({ deal });
  return (
    <>
      <IconButton
        aria-label="Add Deal Address"
        isLoading={isChanging}
        colorScheme="secondary" {...rest} variant="secondary"
        icon={<Icon as={EditIcon}/>} onClick={show}
      />
      {addAddressPopup}
    </>
  );
}
