import React, { ReactElement, useCallback, useMemo, useState } from 'react';
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
  ChargeCodeConfig,
  FPConfig,
  AffordableConfiguration,
  RRFExtractedData,
  UnitSelectionBasis, FloorPlanSqFtSummary,
} from '../../../../../../types';
import { noopObject } from '../../../../../../bootstrap/utils/noop';
import { useRentRollDataService } from '../../../../../services/document/RentRollDataService';
import { useMap } from 'react-use';
import { SettingsIcon } from '../../../icons';
import { useDealDocumentsService } from '../../../../../services/account/user/DealDocumentsService';
import { AffordableLeaseTypes } from '../../../../../enums/AffordableLeaseTypes';


export interface AffordableUnitsModalProps {
  isOpen: boolean;
  onClose: () => void;
  floorPlanConfig?: FPConfig;
  floorPlanSummary: FloorPlanSqFtSummary;
  chargeCodeConfig?: ChargeCodeConfig;
  defaultAffordableConfig: AffordableConfiguration;
  onConfirm: (AffordableConfiguration) => void;
  isSaving: boolean;
}

export function AffordableUnitsModal(
  {
    isOpen, onClose, floorPlanConfig, chargeCodeConfig, floorPlanSummary, onConfirm,
    defaultAffordableConfig, isSaving,
  }: AffordableUnitsModalProps) {
  const [hasAffordable, setHasAffordable, resetHasAffordable] = useBool(defaultAffordableConfig.hasAffordable);
  const [affordableBasis, setAffordableBasis] = useState<UnitSelectionBasis>(defaultAffordableConfig.affordableBasis);
  const [affordableConfig, { set }] = useMap<Record<string, string>>(defaultAffordableConfig.affordableConfig);

  const handleSave = useCallback(() => {
    onConfirm({
      hasAffordable,
      affordableBasis,
      affordableConfig,
    });
  }, [onConfirm, hasAffordable, affordableBasis, affordableConfig]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} closeOnOverlayClick={false} size="4xl" scrollBehavior="inside">
      <ModalOverlay/>
      <ModalContent>
        <ModalHeader>Unit Affordable</ModalHeader>
        <ModalCloseButton/>
        <ModalBody display="flex" flexDir="column">
          <FlexCol border="1px solid" borderColor="border.500" p={4} flexShrink={0} rounded="sm">
            <Flex justify="space-between">
              <Heading>Does this rent roll have affordable units?</Heading>
              <HStack>
                <Button size="xs" variant={hasAffordable ? 'solid' : 'secondary'} onClick={setHasAffordable}>
                  Yes, it has
                </Button>
                <Button size="xs" variant={hasAffordable ? 'secondary' : 'solid'} onClick={resetHasAffordable}>
                  {'No, it doesn\'t'}
                </Button>
              </HStack>
            </Flex>

            {hasAffordable && (
              <>
                <Divider my={4}/>
                <Flex justify="space-between">
                  <Text flexShrink={0}>Identify units based on</Text>
                  <Select
                    isDisabled={!hasAffordable}
                    value={affordableBasis}
                    onChange={(e) => setAffordableBasis(e.target.value as UnitSelectionBasis)}
                    w="auto" flexGrow={0}
                  >
                    <option value="charge-code">Charge Code</option>
                    <option value="floor-plan">Floor Plan</option>
                  </Select>
                </Flex>
              </>
            )}
          </FlexCol>

          {hasAffordable && affordableBasis === 'charge-code' && (
            <FlexCol p={4} border="1px solid" borderColor="border.500" mt={4} rounded="sm">
              <TableContainer overflowY="auto">
                <Table variant="unstyled" size="sm">
                  <Thead>
                    <Tr>
                      <Th>Rent Roll Charges</Th>
                      <Th>Standardised Charge</Th>
                      <Th>Affordable Status</Th>
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
                            value={affordableConfig[code] ?? AffordableLeaseTypes.Market.key}
                            onChange={(e) => set(code, e.target.value)}
                          >
                            {
                              AffordableLeaseTypes.all().map((leaseType) =>
                                <option key={leaseType.key} value={leaseType.key}>{leaseType.label}</option>,
                              )}
                          </Select>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </TableContainer>
            </FlexCol>
          )}

          {hasAffordable && affordableBasis === 'floor-plan' && (
            <FlexCol p={4} border="1px solid" borderColor="border.500" mt={4}>
              <TableContainer overflowY="auto">
                <Table variant="unstyled" size="sm">
                  <Thead>
                    <Tr>
                      <Th>Floor Plan</Th>
                      <Th>Avg Sq Ft</Th>
                      <Th># Units</Th>
                      <Th>Affordable Status</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {Reflect.ownKeys(floorPlanConfig).map((floorPlan: string) => (
                      <Tr key={floorPlan}>
                        <Td fontSize="sm">{floorPlan ?? '[Empty]'}</Td>
                        <Td fontSize="sm">{floorPlanSummary[floorPlan]?.avgSqFt}</Td>
                        <Td fontSize="sm">{floorPlanSummary[floorPlan]?.unitsCount}</Td>
                        <Td>
                          <Select
                            size="xs"
                            value={affordableConfig[floorPlan] ?? AffordableLeaseTypes.Market.key}
                            onChange={(e) => set(floorPlan, e.target.value)}
                          >
                            {
                              AffordableLeaseTypes.all().map((leaseType) =>
                                <option key={leaseType.key} value={leaseType.key}>{leaseType.label}</option>,
                              )}
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

export interface UseAffordableUnitsModalProps {
  dealId: string;
  documentId: string;
  data?: RRFExtractedData;
  onAffordableStatusUpdate: (values: boolean[]) => void;
  floorPlanConfig?: FPConfig;
  chargeCodeConfig?: ChargeCodeConfig;
}

export function useAffordableUnitsModal(
  {
    dealId, documentId,
    data,
    onAffordableStatusUpdate,
    floorPlanConfig,
    chargeCodeConfig,
  }: UseAffordableUnitsModalProps,
): [ReactElement, () => void] {
  const rentRollDataService = useRentRollDataService();
  const [isOpen, show, hide] = useIsVisible();
  const documentService = useDealDocumentsService();
  const updateMutation = documentService.useUpdateLastUpdatedAffordableConfigConfigMutation();
  const lastUserAffordableConfigQuery = documentService.useLastUpdatedAffordableConfig(dealId, documentId);
  const lastUserAffordableConfig: AffordableConfiguration = lastUserAffordableConfigQuery.data ?? {
    hasAffordable: false,
    affordableBasis: 'charge-code',
    affordableConfig: {},
  };

  const fpSqFtConfig = useMemo(() => {
    return data ? rentRollDataService.getFPSqFtSummary(data) : noopObject;
  }, [rentRollDataService, data]);

  const handleUpdateAffordable = useCallback(async (config: AffordableConfiguration) => {
    const affordableStatus = rentRollDataService.prepareAffordableStatus(data, config);
    onAffordableStatusUpdate(affordableStatus);
    await updateMutation.mutateAsync({
      dealId, documentId, lastUsedAffordableConfig: config,
    });
    hide();
  }, [data, rentRollDataService, onAffordableStatusUpdate, hide, updateMutation, dealId, documentId]);

  const modal = (
    <AffordableUnitsModal
      isOpen={isOpen} onClose={hide}
      floorPlanConfig={floorPlanConfig ?? noopObject}
      chargeCodeConfig={chargeCodeConfig ?? noopObject}
      floorPlanSummary={fpSqFtConfig} onConfirm={handleUpdateAffordable}
      defaultAffordableConfig={lastUserAffordableConfig}
      isSaving={updateMutation.isLoading}
    />
  );

  return [modal, show];
}


export interface UseAffordableUnitsModalButtonProps extends ButtonProps {
  dealId: string;
  documentId: string;
  data?: RRFExtractedData;
  onAffordableStatusUpdate: (values: boolean[]) => void;
  floorPlanConfig?: FPConfig;
  chargeCodeConfig?: ChargeCodeConfig;
}

export function UseAffordableUnitsModalButton(
  {
    dealId,
    documentId,
    data,
    onAffordableStatusUpdate,
    floorPlanConfig,
    chargeCodeConfig,
    ...buttonProps
  }: UseAffordableUnitsModalButtonProps,
) {
  const [modal, showModal] = useAffordableUnitsModal(
    {
      dealId, documentId, data, onAffordableStatusUpdate, floorPlanConfig, chargeCodeConfig,
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
