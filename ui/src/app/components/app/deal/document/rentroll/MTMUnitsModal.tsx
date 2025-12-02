import React, { ReactElement, useCallback, useState } from 'react';
import {
  Button, ButtonProps,
  Divider,
  Flex,
  Heading,
  HStack, Icon,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
} from '@chakra-ui/react';
import { useIsVisible } from '../../../../../../bootstrap/hooks/utils/useIsVisible';
import { FlexCol } from '../../../../../../bootstrap/chakra/components/layouts/FlexCol';
import { useBool } from '../../../../../../bootstrap/hooks/utils/useBool';
import {
  ChargeCodeConfig, DealDocument,
  MtmConfiguration, MtmUnitSelectionBasis,
  RRFExtractedData,
} from '../../../../../../types';
import { noopObject } from '../../../../../../bootstrap/utils/noop';
import { useRentRollDataService } from '../../../../../services/document/RentRollDataService';
import { useMap } from 'react-use';
import { SettingsIcon } from '../../../icons';
import { useDealDocumentsService } from '../../../../../services/account/user/DealDocumentsService';


export interface MtmUnitsModalProps {
  isOpen: boolean;
  onClose: () => void;
  chargeCodeConfig?: ChargeCodeConfig;
  defaultMtmConfig: MtmConfiguration;
  onConfirm: (MtmConfiguration) => void;
  isSaving: boolean;
}

export function MtmUnitsModal(
  {
    isOpen, onClose, chargeCodeConfig, onConfirm,
    defaultMtmConfig, isSaving,
  }: MtmUnitsModalProps) {
  const [hasMtm, setHasMtms, resetHasMtms] = useBool(defaultMtmConfig.hasMtm);
  const [mtmBasis, setMtmBasis] = useState<MtmUnitSelectionBasis>(defaultMtmConfig.mtmBasis);
  const [mtmConfig, { set }] = useMap<Record<string, boolean>>(defaultMtmConfig.mtmConfig);

  const handleSave = useCallback(() => {
    onConfirm({
      hasMtm,
      mtmBasis,
      mtmConfig,
    });
  }, [onConfirm, hasMtm, mtmBasis, mtmConfig]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} closeOnOverlayClick={false} size="4xl" scrollBehavior="inside">
      <ModalOverlay/>
      <ModalContent>
        <ModalHeader>MTM Units</ModalHeader>
        <ModalCloseButton/>
        <ModalBody display="flex" flexDir="column">
          <FlexCol border="1px solid" borderColor="border.500" p={4} flexShrink={0} rounded="sm">
            <Flex justify="space-between">
              <Heading>Does this rent roll have MTM units?</Heading>
              <HStack>
                <Button size="xs" variant={hasMtm ? 'solid' : 'secondary'} onClick={setHasMtms}>
                  Yes, it has
                </Button>
                <Button size="xs" variant={hasMtm ? 'secondary' : 'solid'} onClick={resetHasMtms}>
                  {'No, it doesn\'t'}
                </Button>
              </HStack>
            </Flex>

            {hasMtm && (
              <>
                <Divider my={4}/>
                <Flex justify="space-between">
                  <Text flexShrink={0}>Identify units based on</Text>
                  <Select
                    isDisabled={!hasMtm}
                    value={mtmBasis}
                    onChange={(e) => setMtmBasis(e.target.value as MtmUnitSelectionBasis)}
                    w="auto" flexGrow={0}
                  >
                    <option value="charge-code">Charge Code</option>
                    <option value="as-on-date">As Of Date</option>
                  </Select>
                </Flex>
              </>
            )}
          </FlexCol>

          {hasMtm && mtmBasis === 'charge-code' && (
            <FlexCol p={4} border="1px solid" borderColor="border.500" mt={4} rounded="sm">
              <TableContainer overflowY="auto">
                <Table variant="unstyled" size="sm">
                  <Thead>
                    <Tr>
                      <Th>Rent Roll Charges</Th>
                      <Th>Standardised Charge</Th>
                      <Th>Mtm Status</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {Reflect.ownKeys(chargeCodeConfig).map((code: string) => (
                      <Tr key={code}>
                        <Td fontSize="sm">{code}</Td>
                        <Td fontSize="sm">{chargeCodeConfig[code]}</Td>
                        <Td>
                          <Select
                            size="xs"
                            value={mtmConfig[code] ? 'MTM' : 'non-MTM'}
                            onChange={(e) => set(code, e.target.value === 'MTM')}
                          >
                            <option value="non-MTM">Non-MTM</option>
                            <option value="MTM">MTM</option>
                          </Select>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </TableContainer>
            </FlexCol>
          )}
        </ModalBody>
        <ModalFooter>
          <HStack>
            <Button variant="outline" onClick={onClose} isDisabled={isSaving}>
              Cancel
            </Button>
            <Button onClick={handleSave} isLoading={isSaving}>Save</Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export interface UseMtmUnitsModalProps {
  dealId: string;
  document: DealDocument;
  data?: RRFExtractedData;
  onMtmStatusUpdate: (values: boolean[]) => void;
  chargeCodeConfig?: ChargeCodeConfig;
}

export function useMtmUnitsModal(
  {
    dealId, document,
    data,
    onMtmStatusUpdate,
    chargeCodeConfig,
  }: UseMtmUnitsModalProps,
): [ReactElement, () => void] {
  const rentRollDataService = useRentRollDataService();
  const [isOpen, show, hide] = useIsVisible();
  const documentService = useDealDocumentsService();
  const updateMutation = documentService.useUpdateLastUpdatedMtmConfigConfigMutation();
  const lastUserMtmConfigQuery = documentService.useLastUpdatedMtmConfig(dealId, document?.id);
  const lastUserMtmConfig: MtmConfiguration = lastUserMtmConfigQuery.data ?? {
    hasMtm: false,
    mtmBasis: 'charge-code',
    mtmConfig: {},
  };

  const handleUpdateMtms = useCallback(async (config: MtmConfiguration) => {
    const MtmStatus = rentRollDataService.prepareMtmStatus(data, config, document?.asOnDate);
    onMtmStatusUpdate(MtmStatus);
    await updateMutation.mutateAsync({
      dealId, documentId: document?.id, lastUsedMtmConfig: config,
    });
    hide();
  }, [data, rentRollDataService, onMtmStatusUpdate, hide, updateMutation, dealId, document?.id, document?.asOnDate]);

  const modal = (
    <MtmUnitsModal
      isOpen={isOpen} onClose={hide}
      chargeCodeConfig={chargeCodeConfig ?? noopObject}
      onConfirm={handleUpdateMtms}
      defaultMtmConfig={lastUserMtmConfig}
      isSaving={updateMutation.isLoading}
    />
  );

  return [modal, show];
}


export interface UseMtmUnitsModalButtonProps extends ButtonProps {
  dealId: string;
  document: DealDocument;
  data?: RRFExtractedData;
  onMtmStatusUpdate: (values: boolean[]) => void;
  chargeCodeConfig?: ChargeCodeConfig;
}

export function UseMtmUnitsModalButton(
  {
    dealId,
    document,
    data,
    onMtmStatusUpdate,
    chargeCodeConfig,
    ...buttonProps
  }: UseMtmUnitsModalButtonProps,
) {
  const [modal, showModal] = useMtmUnitsModal(
    {
      dealId, document, data, onMtmStatusUpdate: onMtmStatusUpdate, chargeCodeConfig,
    },
  );

  return (
    <>
      <Button
        size="xs" variant="outline" colorScheme="gray" rightIcon={<Icon as={SettingsIcon}/>}
        justifyContent="space-between" onClick={showModal} {...buttonProps}
      >
        Configure
      </Button>
      {modal}
    </>
  );
}
