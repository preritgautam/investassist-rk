import React, { ReactElement, useCallback, useState } from 'react';
import {
  Button,
  chakra,
  FormControl, FormLabel, HStack, Input, InputRightAddon, Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent, ModalFooter,
  ModalHeader,
  ModalOverlay, Text,
} from '@chakra-ui/react';
import { InputGroup } from '@chakra-ui/input';
import { FormErrors } from '../../../../../bootstrap/chakra/components/core/form/FormErrors';
import { requiredLabel } from '../../../../../bootstrap/chakra/components/core/form/RequiredLabel';
import { FieldErrorMessage } from '../../../../../bootstrap/chakra/components/core/form/FieldErrorMessage';
import { useApiForm } from '../../../../../bootstrap/hooks/utils/useApiForm';
import { Deal, DealDocument } from '../../../../../types';
import { useIsVisible } from '../../../../../bootstrap/hooks/utils/useIsVisible';
import { useDealDocumentsService } from '../../../../services/account/user/DealDocumentsService';

export interface RenameDocumentFormData {
  name: string;
}

export interface RenameDocumentFilePopupProps {
  isOpen: boolean;
  onClose: () => void;
  document: DealDocument;
  onSubmit: (values: RenameDocumentFormData) => void;
}

export function RenameDocumentFilePopup({ document, isOpen, onClose, onSubmit }: RenameDocumentFilePopupProps) {
  const fileExtension = document.name?.split('.').reverse()[0];

  const { register, handleSubmit, formState: { errors }, formErrors, clearFormErrors } =
    useApiForm<RenameDocumentFormData>({
      defaultValues: { name: document.name.replace(`.${fileExtension}`, '') },
      onSubmit,
    });

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalOverlay/>
      <ModalContent>
        <ModalHeader>Rename Document</ModalHeader>
        <ModalCloseButton/>
        <ModalBody>
          <chakra.form id="rename-document-file-name" onSubmit={handleSubmit}>
            <FormErrors errors={formErrors} onClose={clearFormErrors}/>
            <FormControl>
              <FormLabel>Name{requiredLabel}</FormLabel>
              <InputGroup>
                <Input {...register('name', {
                  required: 'Please provide document file name',
                })}/>
                <InputRightAddon>
                  <Text>.{fileExtension}</Text>
                </InputRightAddon>
              </InputGroup>
              <FieldErrorMessage error={errors.name}/>
            </FormControl>
          </chakra.form>
        </ModalBody>

        <ModalFooter>
          <HStack>
            <Button onClick={onClose} variant="outline">Cancel</Button>
            <Button type="submit" form="rename-document-file-name">Done</Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}


export interface useRenameDocumentFilePopupProps {
  document: DealDocument;
  deal: Deal;
}

export type useRenameDocumentFilePopupReturn = [ReactElement, () => void, () => void, boolean]

export function useRenameDocumentFilePopup(
  { document, deal }: useRenameDocumentFilePopupProps,
): useRenameDocumentFilePopupReturn {
  const [isOpen, show, hide] = useIsVisible();
  const [isRenaming, setIsRenaming] = useState(false);
  const fileExtension = document.name?.split('.').reverse()[0];

  const { renameDealDocumentMutation } = useDealDocumentsService().useQueries(deal.id);
  const handleRename = useCallback(async (values: RenameDocumentFormData) => {
    setIsRenaming(true);
    hide();
    const { name } = values;
    await renameDealDocumentMutation.mutateAsync({
      dealId: deal.id,
      documentId: document.id,
      name: `${name}.${fileExtension}`,
    }, {
      onSettled() {
        setIsRenaming(false);
      },
    });
  }, [deal.id, document.id, fileExtension, renameDealDocumentMutation, hide]);

  const renamePopup = (
    <RenameDocumentFilePopup document={document} isOpen={isOpen} onClose={hide} onSubmit={handleRename}/>
  );

  return [renamePopup, show, hide, isRenaming];
}
