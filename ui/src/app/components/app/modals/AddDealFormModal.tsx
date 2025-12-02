import {
  Button, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay,
} from '@chakra-ui/react';
import React, { useCallback } from 'react';
import { AddDealForm } from '../forms/deal/AddDealForm';
import { useRoutingService } from '../../../services/RoutingService';
import { Deal } from '../../../../types';
import { ModalProps } from '@chakra-ui/modal';

export interface AddDealFormModalProps extends Omit<ModalProps, 'children'> {
  title: string,
}

export function AddDealFormModal({ title, onClose, ...rest }: AddDealFormModalProps) {
  const routing = useRoutingService();

  const handleSuccess = useCallback(async (deal: Deal) => {
    onClose();
    await routing.gotoUserDealPage(deal.slug);
  }, [onClose, routing]);

  return (
    <>
      <Modal onClose={onClose} size="2xl" {...rest}>
        <ModalOverlay/>
        <ModalContent>
          <ModalHeader>{title}</ModalHeader>
          <ModalCloseButton/>
          <ModalBody>
            <AddDealForm formId="deal-form" onSuccess={handleSuccess}/>
          </ModalBody>

          <ModalFooter>
            <Button variant="outline" mr={3} onClick={onClose} size="sm">Cancel</Button>
            <Button colorScheme="primary" type="submit" form="deal-form" size="sm" minW={24}>Save</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
