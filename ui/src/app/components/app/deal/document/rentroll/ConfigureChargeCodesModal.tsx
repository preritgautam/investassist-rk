import {
  Button, Flex, HStack,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay, Select,
  Text,
} from '@chakra-ui/react';
import React, { ReactElement, useCallback, useEffect } from 'react';
import { useIsVisible } from '../../../../../../bootstrap/hooks/utils/useIsVisible';
import { ChargeCodeConfig } from '../../../../../../types';
import { FlexCol } from '../../../../../../bootstrap/chakra/components/layouts/FlexCol';
import { RentRollChargeCode } from '../../../../../enums/RentRollChargeCode';
import { useMap } from 'react-use';
import { useDealDocumentsService } from '../../../../../services/account/user/DealDocumentsService';
import { useSimpleToast } from '../../../../../hooks/utils/useSimpleToast';

export interface ConfigureChargeCodesModalProps {
  isOpen: boolean;
  onClose: () => void;
  chargeCodeConfig: ChargeCodeConfig;
  onConfirm: (mapping: ChargeCodeConfig) => void;
  isSaving: boolean;
}

export function ConfigureChargeCodesModal(
  {
    isOpen,
    onClose,
    chargeCodeConfig,
    onConfirm,
    isSaving,
  }: ConfigureChargeCodesModalProps,
) {
  const [editedChargeCodeConfig, { set, setAll }] = useMap<ChargeCodeConfig>({});

  useEffect(() => {
    setAll(chargeCodeConfig);
  }, [chargeCodeConfig, setAll]);

  const handleChange = useCallback((chargeCode, mappingValue) => {
    set(chargeCode, mappingValue);
  }, [set]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} closeOnOverlayClick={false} returnFocusOnClose={false}
      scrollBehavior="inside" size="md">
      <ModalOverlay/>
      <ModalContent>
        <ModalHeader>Charge Codes Configuration</ModalHeader>
        <ModalCloseButton/>
        <ModalBody>
          <FlexCol gap={1}>
            {Reflect.ownKeys(editedChargeCodeConfig).map((chargeCode: string) => (
              <Flex key={chargeCode}>
                <Text w="50%" fontSize="sm">{chargeCode}</Text>
                <Select
                  w="50%" defaultValue={editedChargeCodeConfig[chargeCode]} size="xs"
                  onChange={(e) => handleChange(chargeCode, e.target.value)}
                >
                  <option value="">-Select-</option>
                  {RentRollChargeCode.all().map((cc: RentRollChargeCode) => (
                    <option key={cc.key} value={cc.key}>{cc.label}</option>
                  ))}
                </Select>
              </Flex>
            ))}
          </FlexCol>
        </ModalBody>

        <ModalFooter>
          <HStack>
            <Button variant="outline" onClick={onClose} isDisabled={isSaving}>Cancel</Button>
            <Button onClick={() => onConfirm(editedChargeCodeConfig)} isLoading={isSaving}>Save</Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}


export interface UseConfigureChargeCodeModalProps {
  dealId: string;
  documentId: string;
}

export type UseConfigureChargeCodeModalReturn = [ReactElement<ConfigureChargeCodesModalProps>, () => void, () => void];

export function useConfigureChargeCodeModal(
  { dealId, documentId }: UseConfigureChargeCodeModalProps,
): UseConfigureChargeCodeModalReturn {
  const [isOpen, show, hide] = useIsVisible();
  const updateMutation = useDealDocumentsService().useUpdateChargeCodeConfigMutation();
  const toast = useSimpleToast();
  const chargeCodeConfigQuery = useDealDocumentsService().useChargeCodeConfig(dealId, documentId);
  const chargeCodeConfig = chargeCodeConfigQuery.data;

  const handleShow = useCallback(async () => {
    await chargeCodeConfigQuery.refetch();
    show();
  }, [show, chargeCodeConfigQuery]);

  const handleSubmit = useCallback(async (chargeCodeConfig: ChargeCodeConfig) => {
    await updateMutation.mutateAsync({ dealId, documentId, chargeCodeConfig }, {
      onSuccess: () => {
        hide();
        toast({
          title: 'Success!',
          description: 'Charge codes configuration updated.',
        });
      },
    });
  }, [updateMutation, hide, dealId, documentId, toast]);

  const modal = (
    <>
      {chargeCodeConfig && isOpen && (
        <ConfigureChargeCodesModal
          isOpen={isOpen} onClose={hide} chargeCodeConfig={chargeCodeConfig}
          onConfirm={handleSubmit} isSaving={updateMutation.isLoading}
        />
      )}
    </>
  );

  return [modal, handleShow, hide];
}
