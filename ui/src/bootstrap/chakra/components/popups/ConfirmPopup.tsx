import React, { ReactElement, useCallback } from 'react';
import {
  Button, HStack, Modal, ModalBody, ModalCloseButton, ModalContent,
  ModalFooter, ModalHeader, ModalOverlay, ThemingProps,
} from '@chakra-ui/react';
import { useIsVisible } from '../../../hooks/utils/useIsVisible';

export interface ConfirmPopupProps {
  children: ReactElement;
  title: string,
  message: string,
  okText?: string,
  cancelText?: string,
  onConfirm?: () => void,
  onCancel?: () => void,
  colorScheme?: ThemingProps['colorScheme'],
}

export function ConfirmPopup(
  { title, message, okText, cancelText, onCancel, onConfirm, children, colorScheme }: ConfirmPopupProps,
) {
  const [isOpen, onOpen, onClose] = useIsVisible();

  const handleCancel = useCallback(() => {
    onClose();
    onCancel?.();
  }, [onCancel, onClose]);

  const handleConfirm = useCallback(() => {
    onClose();
    onConfirm?.();
  }, [onConfirm, onClose]);

  return (
    <>
      {React.cloneElement(children, { onClick: onOpen })}

      <Modal isOpen={isOpen} onClose={handleCancel} isCentered closeOnOverlayClick={false}>
        <ModalOverlay/>
        <ModalContent>
          <ModalHeader>{title}</ModalHeader>
          <ModalCloseButton/>
          <ModalBody>{message}</ModalBody>
          <ModalFooter>
            <HStack>
              <Button onClick={handleCancel} variant="outline" colorScheme="secondary">{cancelText ?? 'Cancel'}</Button>
              <Button onClick={handleConfirm} minW={20} colorScheme={colorScheme}>{okText ?? 'Ok'}</Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
