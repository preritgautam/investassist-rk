import React, { ReactElement, useCallback } from 'react';
import { Deal, DealDocument } from '../../../../../../types';
import { ModalProps } from '@chakra-ui/modal';
import { useIsVisible } from '../../../../../../bootstrap/hooks/utils/useIsVisible';
import {
  Button, chakra, FormControl, FormLabel, HStack,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay, Select,
  Text, Textarea, VStack,
} from '@chakra-ui/react';
import { requiredLabel } from '../../../../../../bootstrap/chakra/components/core/form/RequiredLabel';
import { useApiForm } from '../../../../../../bootstrap/hooks/utils/useApiForm';
import { FieldErrorMessage } from '../../../../../../bootstrap/chakra/components/core/form/FieldErrorMessage';
import { useDealDocumentsService } from '../../../../../services/account/user/DealDocumentsService';
import { useSuccessToast } from '../../../../../../bootstrap/hooks/utils/useSuccessToast';
import { BodyXS, HeadingXS } from '../../../../../../bootstrap/chakra/components/typography';
import { LinkButton } from '../../../../../../bootstrap/chakra/components/core/LinkButton';


export type IssueType =
  | 'NO_DATA_EXTRACTED'
  | 'PARTIAL_DATA_EXTRACTED'
  | 'EXTRA_DATA_EXTRACTED'
  | 'OTHERS'

export interface TicketDetails {
  issueType: IssueType;
  details?: string;
}


export interface RaiseTicketFormProps {
  formId: string;
  onSubmit: (values: TicketDetails) => void;
}

export function RaiseTicketForm({ formId, onSubmit }: RaiseTicketFormProps) {
  const { register, formState: { errors }, handleSubmit, watch } = useApiForm<TicketDetails>({
    onSubmit,
    defaultValues: {
      issueType: 'NO_DATA_EXTRACTED',
    },
  });


  return (
    <chakra.form id={formId} onSubmit={handleSubmit}>
      <VStack>
        <FormControl>
          <FormLabel>Issue Type{requiredLabel}</FormLabel>
          <Select {...register('issueType', {
            required: 'Please select appropriate issue type',
          })}>
            <option value="NO_DATA_EXTRACTED">No data was extracted</option>
            <option value="PARTIAL_DATA_EXTRACTED">Partial data was extracted</option>
            <option value="EXTRA_DATA_EXTRACTED">Extra data was extracted</option>
            <option value="OTHERS">Others</option>
          </Select>
          <FieldErrorMessage error={errors.issueType}/>
        </FormControl>
        <FormControl>
          <FormLabel>More Details{watch('issueType') === 'OTHERS' ? requiredLabel : '(optional)'}</FormLabel>
          <Textarea {...register('details',
            { required: watch('issueType') === 'OTHERS' ? 'Please add issue description.' : false },
          )}></Textarea>
          <FieldErrorMessage error={errors.details}/>
        </FormControl>
      </VStack>
    </chakra.form>
  );
}


export interface RaiseTicketFormModalProps {
  modalProps?: Omit<ModalProps, 'children'>,
  onSubmit: (values: TicketDetails) => void;
  isLoading: boolean;
  templateFilePath: string;
}

export function RaiseTicketFormModal({ modalProps, onSubmit, isLoading, templateFilePath }: RaiseTicketFormModalProps) {
  return (
    <Modal {...modalProps}>
      <ModalOverlay/>
      <ModalContent>
        <ModalHeader>Raise Support Ticket</ModalHeader>
        <ModalCloseButton/>
        <ModalBody>
          <Text fontSize="sm" mb={4}>
            Please provide following details so that we can handle the issue you are facing appropriately
          </Text>
          <RaiseTicketForm formId="raise-ticket-form" onSubmit={onSubmit}/>
          <Text fontSize="xs" mt={4}>
            <LinkButton href={templateFilePath} colorScheme="primary" size="xs" target="_blank">
              Download document template file
            </LinkButton>
            &nbsp;to manually process the file while we work on resolving your issue.
          </Text>
        </ModalBody>
        <ModalFooter>
          <HStack>
            <Button variant="outline" onClick={modalProps.onClose} isDisabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" form="raise-ticket-form" isLoading={isLoading}>
              Raise Ticket
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export interface UseRaiseTicketModalProps {
  deal: Deal;
  document: DealDocument;
}

export type UseRaiseTicketModalReturn = [ReactElement, () => void];

export function useRaiseTicketModal({ deal, document }: UseRaiseTicketModalProps): UseRaiseTicketModalReturn {
  const [isOpen, show, hide] = useIsVisible(false);
  const documentService = useDealDocumentsService();
  const raiseTicketMutation = documentService.useRaiseTicketMutation();
  const toast = useSuccessToast();
  const templateFilePath = `/assets/files/${
    document.documentType === 'RRF' ? 'Rent Roll Template.xlsx' : 'CashFlow Template.xlsx'
  }`;

  const handleSubmit = useCallback(async (values: TicketDetails) => {
    await raiseTicketMutation.mutateAsync({
      dealId: deal.id, documentId: document.id, ticketParams: values,
    });
    hide();
    toast({
      title: <HeadingXS>Success!</HeadingXS>,
      description: <BodyXS>Successfully raised a support ticket. You&apos;ll hear from us soon.</BodyXS>,
      containerStyle: {
        borderRadius: 'xs',
      },
    });
  }, [raiseTicketMutation, deal.id, document.id, hide, toast]);

  const modal = (
    <RaiseTicketFormModal
      modalProps={{
        isOpen: isOpen,
        onClose: hide,
      }}
      onSubmit={handleSubmit}
      isLoading={raiseTicketMutation.isLoading}
      templateFilePath={templateFilePath}
    />
  );

  return [modal, show];
}
