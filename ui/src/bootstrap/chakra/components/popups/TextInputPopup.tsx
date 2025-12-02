import React, { ReactElement } from 'react';
import {
  Button,
  chakra,
  FormControl, FormLabel, HStack, Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent, ModalFooter,
  ModalHeader,
  ModalOverlay,
} from '@chakra-ui/react';
import { FormErrors } from '../core/form/FormErrors';
import { requiredLabel } from '../core/form/RequiredLabel';
import { FieldErrorMessage } from '../core/form/FieldErrorMessage';
import { useApiForm } from '../../../hooks/utils/useApiForm';
import { RegisterOptions } from 'react-hook-form/dist/types/validator';
import { useIsVisible } from '../../../hooks/utils/useIsVisible';

export interface TextInputData {
  value: string;
}

export interface TextInputPopupProps {
  isOpen: boolean;
  onClose: () => void;
  header: string;
  onSubmit: (values: { value: string }) => void,
  defaultValue?: string;
  validationOptions?: RegisterOptions<TextInputData>
}

export function TextInputPopup(
  { onSubmit, header, isOpen, onClose, defaultValue, validationOptions }: TextInputPopupProps,
) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    formErrors,
    clearFormErrors,
  } = useApiForm<TextInputData>({
    defaultValues: { value: defaultValue },
    onSubmit: async (values: TextInputData) => {
      onClose();
      onSubmit(values);
    },
  });


  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalOverlay/>
      <ModalContent>
        <ModalHeader>{header}</ModalHeader>
        <ModalCloseButton/>
        <ModalBody>
          <chakra.form id="rename-document-file-name" onSubmit={handleSubmit}>
            <FormErrors errors={formErrors} onClose={clearFormErrors}/>
            <FormControl>
              <FormLabel>Name{requiredLabel}</FormLabel>
              <Input {...register('value', validationOptions)}/>
              <FieldErrorMessage error={errors.value}/>
            </FormControl>
          </chakra.form>
        </ModalBody>

        <ModalFooter>
          <HStack>
            <Button onClick={onClose}>Close</Button>
            <Button type="submit" form="rename-document-file-name">Done</Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}


export interface useTextInputPopupProps {
  header: string;
  onSubmit: (values: { value: string }) => void,
  defaultValue?: string;
  validationOptions?: RegisterOptions<TextInputData>
}

export type useTextInputPopupReturn = [ReactElement, () => void, () => void]

export function useTextInputPopup(
  { header, onSubmit, defaultValue, validationOptions }: useTextInputPopupProps,
): useTextInputPopupReturn {
  const [isOpen, show, hide] = useIsVisible();
  const inputPopup = (
    <TextInputPopup
      isOpen={isOpen} onClose={hide}
      header={header}
      onSubmit={onSubmit}
      defaultValue={defaultValue}
      validationOptions={validationOptions}
    />
  );

  return [inputPopup, show, hide];
}
