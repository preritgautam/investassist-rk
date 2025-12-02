import React, { ReactElement, useCallback, useState } from 'react';
import {
  Button,
  chakra,
  HStack, Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent, ModalFooter,
  ModalHeader,
  ModalOverlay,
} from '@chakra-ui/react';
import { useApiForm } from '../../../../../bootstrap/hooks/utils/useApiForm';
import { Deal, DealAddress } from '../../../../../types';
import { useIsVisible } from '../../../../../bootstrap/hooks/utils/useIsVisible';
import { useDealService } from '../../../../services/account/user/DealService';
import { DealAddressField } from '../DealAddressField';

export interface AddDealAddressPopupProps {
  isOpen: boolean;
  onClose: () => void;
  deal: Deal;
  onSubmit: (values: Deal) => void;
}

export function AddDealAddressPopup({ deal, isOpen, onClose, onSubmit }: AddDealAddressPopupProps) {
  const { handleSubmit, formState: { errors }, setValue } =
    useApiForm<Deal>({
      defaultValues: {
        address: {
          line1: deal.address.line1,
          line2: deal.address.line2,
          city: deal.address.city,
          state: deal.address.state,
          zipCode: deal.address.zipCode,
        },
      },
      onSubmit,
    });

  const [address, setAddress] = useState<DealAddress>(deal?.address);
  const handleAddressChange = useCallback((newAddress: DealAddress) => {
    setAddress(newAddress);
    setValue('address.line1', newAddress.line1);
    setValue('address.line2', newAddress.line2);
    setValue('address.city', newAddress.city);
    setValue('address.state', newAddress.state);
    setValue('address.zipCode', newAddress.zipCode);
  }, [setValue]);


  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay/>
      <ModalContent>
        <ModalHeader>Edit Deal Address</ModalHeader>
        <ModalCloseButton/>
        <ModalBody>
          <chakra.form id="addDealAddress" onSubmit={handleSubmit}>
            <DealAddressField value={address} onChange={handleAddressChange} errors={errors.address}/>
          </chakra.form>
        </ModalBody>
        <ModalFooter>
          <HStack>
            <Button onClick={onClose} variant="outline">Cancel</Button>
            <Button type="submit" form="addDealAddress">Done</Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}


export interface useAddDealAddressPopupProps {
  deal: Deal;
}

export type UseAddDealAddressPopupReturn = [ReactElement, () => void, boolean]

export function useAddDealAddressPopup({ deal }: useAddDealAddressPopupProps): UseAddDealAddressPopupReturn {
  const [isOpen, show, hide] = useIsVisible();
  const { updateDealMutation } = useDealService().useQueries();

  const handleAddressChange = useCallback(async (values: Deal) => {
    hide();
    const { address: { line1, line2, city, state, zipCode } } = values;
    await updateDealMutation.mutateAsync({ id: deal.id, address: { line1, line2, city, state, zipCode } });
  }, [updateDealMutation, deal.id, hide]);

  const addAddressPopup = (
    <>
      {isOpen && (
        <AddDealAddressPopup deal={deal} isOpen={isOpen} onClose={hide} onSubmit={handleAddressChange}/>
      )}
    </>
  );

  return [addAddressPopup, show, updateDealMutation.isLoading];
}
