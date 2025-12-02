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
import { OccupancyConfig } from '../../../../../../types';
import { FlexCol } from '../../../../../../bootstrap/chakra/components/layouts/FlexCol';
import { useMap } from 'react-use';
import { useDealDocumentsService } from '../../../../../services/account/user/DealDocumentsService';
import { useSimpleToast } from '../../../../../hooks/utils/useSimpleToast';
import { RentRollOccupancyStatus } from '../../../../../enums/RentRollOccupancyStatus';

export interface ConfigureOccupancyModalProps {
  isOpen: boolean;
  onClose: () => void;
  occupancyConfig: OccupancyConfig;
  onConfirm: (mapping: OccupancyConfig) => void;
  isSaving: boolean;
}

export function ConfigureOccupancyModal(
  {
    isOpen,
    onClose,
    occupancyConfig,
    onConfirm,
    isSaving,
  }: ConfigureOccupancyModalProps,
) {
  const [editedOccupancyConfig, { set, setAll }] = useMap<OccupancyConfig>({});

  useEffect(() => {
    setAll(occupancyConfig);
  }, [occupancyConfig, setAll]);

  const handleChange = useCallback((occupancy, mappingValue) => {
    set(occupancy, mappingValue);
  }, [set]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} closeOnOverlayClick={false} returnFocusOnClose={false}
      scrollBehavior="inside">
      <ModalOverlay/>
      <ModalContent>
        <ModalHeader>Occupancy Configuration</ModalHeader>
        <ModalCloseButton/>
        <ModalBody>
          <FlexCol gap={1}>
            {Reflect.ownKeys(editedOccupancyConfig).map((occupancy: string) => (
              <Flex key={occupancy}>
                <Text w="50%" fontSize="sm">{occupancy ?? '[Empty]'}</Text>
                <Select
                  w="50%" defaultValue={editedOccupancyConfig[occupancy]} size="xs" m={1}
                  onChange={(e) => handleChange(occupancy, e.target.value)}
                >
                  <option value="">-Select-</option>
                  {RentRollOccupancyStatus.all().map((occ: RentRollOccupancyStatus) => (
                    <option key={occ.key} value={occ.key}>{occ.label}</option>
                  ))}
                </Select>
              </Flex>
            ))}
          </FlexCol>
        </ModalBody>

        <ModalFooter>
          <HStack>
            <Button variant="outline" onClick={onClose} isDisabled={isSaving}>Cancel</Button>
            <Button onClick={() => onConfirm(editedOccupancyConfig)} isLoading={isSaving}>Save</Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}


export interface UseConfigureOccupancyModalProps {
  dealId: string;
  documentId: string;
}

export type UseConfigureOccupancyModalReturn = [ReactElement<ConfigureOccupancyModalProps>, () => void, () => void];

export function useConfigureOccupancyModal(
  { dealId, documentId }: UseConfigureOccupancyModalProps,
): UseConfigureOccupancyModalReturn {
  const [isOpen, show, hide] = useIsVisible();
  const updateMutation = useDealDocumentsService().useUpdateOccupancyConfigMutation();
  const toast = useSimpleToast();
  const occupancyConfigQuery = useDealDocumentsService().useOccupancyConfig(dealId, documentId);
  const occupancyConfig = occupancyConfigQuery.data;

  const handleShow = useCallback(async () => {
    await occupancyConfigQuery.refetch();
    show();
  }, [show, occupancyConfigQuery]);

  const handleSubmit = useCallback(async (occupancyConfig: OccupancyConfig) => {
    await updateMutation.mutateAsync({ dealId, documentId, occupancyConfig }, {
      onSuccess: () => {
        hide();
        toast({
          title: 'Success!',
          description: 'Occupancy configuration updated.',
        });
      },
    });
  }, [updateMutation, hide, dealId, documentId, toast]);

  const modal = (
    <>
      {occupancyConfig && isOpen && (
        <ConfigureOccupancyModal
          isOpen={isOpen} onClose={hide} occupancyConfig={occupancyConfig}
          onConfirm={handleSubmit} isSaving={updateMutation.isLoading}
        />
      )}
    </>
  );

  return [modal, handleShow, hide];
}
