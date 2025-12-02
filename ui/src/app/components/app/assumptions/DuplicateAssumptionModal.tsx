import { useApiForm } from '../../../../bootstrap/hooks/utils/useApiForm';
import { Assumption } from '../../../../types';
import React, { ReactElement, useCallback, useEffect } from 'react';
import {
  Button,
  chakra,
  FormControl,
  FormLabel,
  HStack,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
} from '@chakra-ui/react';
import { FormErrors } from '../../../../bootstrap/chakra/components/core/form/FormErrors';
import { requiredLabel } from '../../../../bootstrap/chakra/components/core/form/RequiredLabel';
import { FieldErrorMessage } from '../../../../bootstrap/chakra/components/core/form/FieldErrorMessage';
import { useIsVisible } from '../../../../bootstrap/hooks/utils/useIsVisible';
import { useAssumptionService } from '../../../services/account/user/AssumptionService';
import { RoutingService, useRoutingService } from '../../../services/RoutingService';

export interface DuplicateAssumptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: Assumption) => void;
  assumption: Assumption;
}

function DuplicateAssumptionModal({ assumption, isOpen, onClose, onSubmit }: DuplicateAssumptionModalProps) {
  const { register, handleSubmit, formState: { errors }, formErrors, clearFormErrors, setValue } =
    useApiForm<Assumption>({
      defaultValues: assumption,
      onSubmit,
    });

  useEffect(() => {
    if (isOpen) {
      setValue('name', `${assumption.name} - Copy`);
    }
  }, [isOpen, setValue, assumption.name]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalOverlay/>
      <ModalContent>
        <ModalHeader>Duplicate Assumption</ModalHeader>
        <ModalCloseButton/>
        <ModalBody>
          <Text mb={4}>Please provide a name for the new assumptions set</Text>
          <chakra.form id="duplicate-assumption-form" onSubmit={handleSubmit}>
            <FormErrors errors={formErrors} onClose={clearFormErrors}/>
            <FormControl>
              <FormLabel>Name{requiredLabel}</FormLabel>
              <Input {...register('name', {
                required: 'Please provide a name for the duplicated assumptions set',
              })}/>
              <FieldErrorMessage error={errors.name}/>
            </FormControl>
          </chakra.form>
        </ModalBody>
        <ModalFooter>
          <HStack>
            <Button onClick={onClose} variant="outline">Close</Button>
            <Button type="submit" form="duplicate-assumption-form">Continue</Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export interface UseDuplicateAssumptionModalProps {
  assumption: Assumption;
}

export type UseDuplicateAssumptionModalReturn = [ReactElement, () => void];

export function useDuplicateAssumptionModal(
  { assumption }: UseDuplicateAssumptionModalProps,
): UseDuplicateAssumptionModalReturn {
  const [isOpen, show, hide] = useIsVisible();
  const addAssumption = useAssumptionService().useAddAssumption();
  const routing = useRoutingService();

  const onSubmit = useCallback(async (values: Assumption) => {
    // eslint-disable-next-line no-unused-vars
    const { id, createdAt, updatedAt, ...assumptionParams } = values;
    const assumption = await addAssumption.mutateAsync(assumptionParams, {
      onSettled: hide,
    });

    await routing.gotoUrl(RoutingService.editUserAssumptionPage(assumption.id));
  }, [addAssumption, routing, hide]);

  const modal = (
    <DuplicateAssumptionModal assumption={assumption} isOpen={isOpen} onClose={hide} onSubmit={onSubmit}/>
  );

  return [modal, show];
}
