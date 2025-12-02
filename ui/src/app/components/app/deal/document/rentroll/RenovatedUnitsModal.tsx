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
  ChargeCodeConfig, FloorPlanSqFtSummary,
  FPConfig,
  RenovationConfiguration,
  RRFExtractedData,
  UnitSelectionBasis,
} from '../../../../../../types';
import { noopObject } from '../../../../../../bootstrap/utils/noop';
import { useRentRollDataService } from '../../../../../services/document/RentRollDataService';
import { useMap } from 'react-use';
import { SettingsIcon } from '../../../icons';
import { useDealDocumentsService } from '../../../../../services/account/user/DealDocumentsService';


export interface RenovatedUnitsModalProps {
  isOpen: boolean;
  onClose: () => void;
  floorPlanConfig?: FPConfig;
  floorPlanSummary: FloorPlanSqFtSummary;
  chargeCodeConfig?: ChargeCodeConfig;
  defaultRenovationConfig: RenovationConfiguration;
  onConfirm: (RenovationConfiguration) => void;
  isSaving: boolean;
}

export function RenovatedUnitsModal(
  {
    isOpen, onClose, floorPlanConfig, chargeCodeConfig, floorPlanSummary, onConfirm,
    defaultRenovationConfig, isSaving,
  }: RenovatedUnitsModalProps) {
  const [hasRenovation, setHasRenovations, resetHasRenovations] = useBool(defaultRenovationConfig.hasRenovation);
  const [renovationBasis, setRenovationBasis] = useState<UnitSelectionBasis>(defaultRenovationConfig.renovationBasis);
  const [renovationConfig, { set }] = useMap<Record<string, boolean>>(defaultRenovationConfig.renovationConfig);

  const handleSave = useCallback(() => {
    onConfirm({
      hasRenovation,
      renovationBasis,
      renovationConfig,
    });
  }, [onConfirm, hasRenovation, renovationBasis, renovationConfig]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} closeOnOverlayClick={false} size="4xl" scrollBehavior="inside">
      <ModalOverlay/>
      <ModalContent>
        <ModalHeader>Unit Renovations</ModalHeader>
        <ModalCloseButton/>
        <ModalBody display="flex" flexDir="column">
          <FlexCol border="1px solid" borderColor="border.500" p={4} flexShrink={0} rounded="sm">
            <Flex justify="space-between">
              <Heading>Does this rent roll have renovated units?</Heading>
              <HStack>
                <Button size="xs" variant={hasRenovation ? 'solid' : 'secondary'} onClick={setHasRenovations}>
                  Yes, it has
                </Button>
                <Button size="xs" variant={hasRenovation ? 'secondary' : 'solid'} onClick={resetHasRenovations}>
                  {'No, it doesn\'t'}
                </Button>
              </HStack>
            </Flex>

            {hasRenovation && (
              <>
                <Divider my={4}/>
                <Flex justify="space-between">
                  <Text flexShrink={0}>Identify units based on</Text>
                  <Select
                    isDisabled={!hasRenovation}
                    value={renovationBasis}
                    onChange={(e) => setRenovationBasis(e.target.value as UnitSelectionBasis)}
                    w="auto" flexGrow={0}
                  >
                    <option value="charge-code">Charge Code</option>
                    <option value="floor-plan">Floor Plan</option>
                  </Select>
                </Flex>
              </>
            )}
          </FlexCol>

          {hasRenovation && renovationBasis === 'charge-code' && (
            <FlexCol p={4} border="1px solid" borderColor="border.500" mt={4} rounded="sm">
              <TableContainer overflowY="auto">
                <Table variant="unstyled" size="sm">
                  <Thead>
                    <Tr>
                      <Th>Rent Roll Charges</Th>
                      <Th>Standardised Charge</Th>
                      <Th>Renovation Status</Th>
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
                            value={renovationConfig[code] ? 'renovated' : 'non-renovated'}
                            onChange={(e) => set(code, e.target.value === 'renovated')}
                          >
                            <option value="non-renovated">Non-Renovated</option>
                            <option value="renovated">Renovated</option>
                          </Select>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </TableContainer>
            </FlexCol>
          )}

          {hasRenovation && renovationBasis === 'floor-plan' && (
            <FlexCol p={4} border="1px solid" borderColor="border.500" mt={4}>
              <TableContainer overflowY="auto">
                <Table variant="unstyled" size="sm">
                  <Thead>
                    <Tr>
                      <Th>Floor Plan</Th>
                      <Th>Avg Sq Ft</Th>
                      <Th># Units</Th>
                      <Th>Renovation Status</Th>
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
                            value={renovationConfig[floorPlan] ? 'renovated' : 'non-renovated'}
                            onChange={(e) => set(floorPlan, e.target.value === 'renovated')}
                          >
                            <option value="non-renovated">Non-Renovated</option>
                            <option value="renovated">Renovated</option>
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

export interface UseRenovatedUnitsModalProps {
  dealId: string;
  documentId: string;
  data?: RRFExtractedData;
  onRenovationStatusUpdate: (values: boolean[]) => void;
  floorPlanConfig?: FPConfig;
  chargeCodeConfig?: ChargeCodeConfig;
}

export function useRenovatedUnitsModal(
  {
    dealId, documentId,
    data,
    onRenovationStatusUpdate,
    floorPlanConfig,
    chargeCodeConfig,
  }: UseRenovatedUnitsModalProps,
): [ReactElement, () => void] {
  const rentRollDataService = useRentRollDataService();
  const [isOpen, show, hide] = useIsVisible();
  const documentService = useDealDocumentsService();
  const updateMutation = documentService.useUpdateLastUpdatedRenovatedConfigConfigMutation();
  const lastUserRenovatedConfigQuery = documentService.useLastUpdatedRenovatedConfigConfig(dealId, documentId);
  const lastUserRenovatedConfig: RenovationConfiguration = lastUserRenovatedConfigQuery.data ?? {
    hasRenovation: false,
    renovationBasis: 'charge-code',
    renovationConfig: {},
  };

  const fpSqFtConfig = useMemo(() => {
    return data ? rentRollDataService.getFPSqFtSummary(data) : noopObject;
  }, [rentRollDataService, data]);

  const handleUpdateRenovations = useCallback(async (config: RenovationConfiguration) => {
    const renovationStatus = rentRollDataService.prepareRenovatedStatus(data, config);
    onRenovationStatusUpdate(renovationStatus);
    await updateMutation.mutateAsync({
      dealId, documentId, lastUsedRenovatedConfig: config,
    });
    hide();
  }, [data, rentRollDataService, onRenovationStatusUpdate, hide, updateMutation, dealId, documentId]);

  const modal = (
    <RenovatedUnitsModal
      isOpen={isOpen} onClose={hide}
      floorPlanConfig={floorPlanConfig ?? noopObject}
      chargeCodeConfig={chargeCodeConfig ?? noopObject}
      floorPlanSummary={fpSqFtConfig} onConfirm={handleUpdateRenovations}
      defaultRenovationConfig={lastUserRenovatedConfig}
      isSaving={updateMutation.isLoading}
    />
  );

  return [modal, show];
}


export interface UseRenovatedUnitsModalButtonProps extends ButtonProps {
  dealId: string;
  documentId: string;
  data?: RRFExtractedData;
  onRenovationStatusUpdate: (values: boolean[]) => void;
  floorPlanConfig?: FPConfig;
  chargeCodeConfig?: ChargeCodeConfig;
}

export function UseRenovatedUnitsModalButton(
  {
    dealId,
    documentId,
    data,
    onRenovationStatusUpdate,
    floorPlanConfig,
    chargeCodeConfig,
    ...buttonProps
  }: UseRenovatedUnitsModalButtonProps,
) {
  const [modal, showModal] = useRenovatedUnitsModal(
    {
      dealId, documentId, data, onRenovationStatusUpdate, floorPlanConfig, chargeCodeConfig,
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
