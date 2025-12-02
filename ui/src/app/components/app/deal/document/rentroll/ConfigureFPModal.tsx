import {
  Button, Flex, HStack,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay, Select, Text, Box,
  Table, TableContainer, Thead, Tr, Th, Td, Tbody, Input,
} from '@chakra-ui/react';
import React, { ReactElement, useCallback, useEffect, useMemo } from 'react';
import { useIsVisible } from '../../../../../../bootstrap/hooks/utils/useIsVisible';
import { FPConfig, FloorPlan, TenantType, RRFExtractedData } from '../../../../../../types';
import { useMap } from 'react-use';
import { useDealDocumentsService } from '../../../../../services/account/user/DealDocumentsService';
import { useRentRollDataService } from '../../../../../services/document/RentRollDataService';
import { useSimpleToast } from '../../../../../hooks/utils/useSimpleToast';
import { FloorPlanBedMapping, FloorPlanBathMapping } from '../../../../../../constants';
import { RentRollTenantTypes } from '../../../../../enums/RentRollTenantTypes';


export interface ConfigureFPModalProps {
  isOpen: boolean;
  onClose: () => void;
  fpConfig: FPConfig;
  fpSqFtConfig: { [fp: string]: { totalSqFt: number; avgSqFt: number; unitsCount: number; } };
  onConfirm: (mapping: FPConfig) => void;
  isSaving: boolean;
  documentData: RRFExtractedData;
}


interface SelectFPFields {
  value: FloorPlan,
  onChange: (value: FloorPlan) => void,
}

function SelectFPFields({ value, onChange }: SelectFPFields) {
  const { beds, baths, tenantType, renameFloorPlan } = value;
  const onBedsChange = useCallback((e) => {
    onChange({
      beds: e.target.value,
      baths: e.target.value === 'studio' ? '' : baths,
      tenantType,
      renameFloorPlan,
    });
  }, [onChange, baths, tenantType, renameFloorPlan]);
  const onBathsChange = useCallback((e) => {
    onChange({ baths: e.target.value, beds, tenantType, renameFloorPlan });
  }, [onChange, beds, tenantType, renameFloorPlan]);
  return (
    <Flex>
      <Select
        value={beds} onChange={onBedsChange} size="xs" w="50%"
        isDisabled={tenantType === RentRollTenantTypes.Commercial.key}
      >
        <option value="">-Select-</option>
        {FloorPlanBedMapping.map((bed) => (
          <option key={bed} value={bed}>{bed}</option>
        ))}
      </Select>
      <Select
        value={baths} onChange={onBathsChange} size="xs" w="50%"
        isDisabled={beds === 'studio' || tenantType === RentRollTenantTypes.Commercial.key}
      >
        <option value="">-Select-</option>
        {FloorPlanBathMapping.map((bath) => (
          <option key={bath} value={bath}>{bath}</option>
        ))}
      </Select>
    </Flex>
  );
}

export function ConfigureFPModal(
  {
    isOpen,
    onClose,
    fpConfig,
    fpSqFtConfig,
    onConfirm,
    isSaving,
    documentData,
  }: ConfigureFPModalProps,
) {
  const [editedFPConfig, { set, setAll }] = useMap<FPConfig>({});
  const rentRollDataService = useRentRollDataService();

  const canFillBedsAndBaths = useMemo(() => {
    return !!(documentData && rentRollDataService.getFloorPlaColumn(documentData));
  }, [rentRollDataService, documentData]);

  const handleBedsBathChange = useCallback((fp: string, value: FloorPlan) => {
    const shouldUpdateName = value.renameFloorPlan === '' ||
      value.renameFloorPlan === 'Studio' ||
      value.renameFloorPlan.match(/^\d+ Bed - \d(\.\d)? Bath$/);

    if (shouldUpdateName) {
      if (value.beds === 'studio') {
        value.renameFloorPlan = 'Studio';
      } else if (value.beds && value.baths) {
        value.renameFloorPlan = `${value.beds} Bed - ${value.baths} Bath`;
      }
    }

    set(fp, value);
  }, [set]);

  const handleFillBedsAndBaths = useCallback(() => {
    // Try filling from beds and bath columns
    const bedsBathsByFp: FPConfig = rentRollDataService.getFPBedsBaths(documentData);
    Reflect.ownKeys(bedsBathsByFp).forEach((fp: string) => {
      handleBedsBathChange(fp, bedsBathsByFp[fp]);
    });
  }, [documentData, rentRollDataService, handleBedsBathChange]);

  useEffect(() => {
    setAll(fpConfig);
  }, [fpConfig, setAll]);
  return (
    <Modal
      isOpen={isOpen} onClose={onClose} closeOnOverlayClick={false} size="4xl" scrollBehavior="inside"
      returnFocusOnClose={false}
    >
      <ModalOverlay/>
      <ModalContent>
        <ModalHeader>Floor Plan Configuration</ModalHeader>
        <ModalCloseButton/>
        <ModalBody>
          <TableContainer>
            <Table variant="unstyled">
              <Thead>
                <Tr>
                  <Th>Floor Plan</Th>
                  <Th>Avg. Sqft</Th>
                  <Th w={64}>Tenant Type</Th>
                  <Th w={96}>
                    <Flex>
                      <Box w="50%">
                        <Text>Beds#</Text>
                      </Box>
                      <Box w="50%">
                        <Text>Baths#</Text>
                      </Box>
                    </Flex>
                  </Th>
                  <Th>Rename Floor Plan</Th>
                </Tr>
              </Thead>
              <Tbody>
                {Reflect.ownKeys(editedFPConfig).map((fp: string) => (
                  <Tr key={fp}>
                    <Td>{fp ?? '[Empty]'}</Td>
                    <Td>
                      <Text>
                        {fpSqFtConfig?.[fp]?.avgSqFt ?? 'NA'}
                      </Text>
                      <Text fontSize="xs" color="gray.500">
                        Units# : {fpSqFtConfig?.[fp]?.unitsCount ?? 'NA'}
                      </Text>
                    </Td>

                    <Td>
                      <Select
                        w="100%" defaultValue={editedFPConfig[fp].tenantType} size="xs"
                        onChange={(e) => set(fp, {
                          ...editedFPConfig[fp],
                          tenantType: e.target.value as TenantType,
                          beds: e.target.value === RentRollTenantTypes.Commercial.key ? '' : editedFPConfig[fp].beds,
                          baths: e.target.value === RentRollTenantTypes.Commercial.key ? '' : editedFPConfig[fp].baths,
                        })}
                      >
                        <option value="">-Select-</option>
                        {RentRollTenantTypes.all().map((tenantType: RentRollTenantTypes) => (
                          <option key={tenantType.key} value={tenantType.key}>{tenantType.label}</option>
                        ))}
                      </Select>
                    </Td>
                    <Td>
                      <SelectFPFields
                        value={editedFPConfig[fp]}
                        onChange={(value: FloorPlan) => handleBedsBathChange(fp, value)}
                      />
                    </Td>
                    <Td>
                      <Input
                        type="text" value={editedFPConfig[fp].renameFloorPlan}
                        size="xs"
                        onChange={(e) => set(
                          fp, { ...editedFPConfig[fp], renameFloorPlan: e.target.value },
                        )}
                      />
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>
        </ModalBody>

        <ModalFooter>
          <Flex justifyContent="space-between" w="full">
            <Button
              variant="outline" onClick={handleFillBedsAndBaths} isDisabled={!canFillBedsAndBaths}
            >Pick Beds/Baths</Button>
            <HStack>
              <Button variant="outline" onClick={onClose} isDisabled={isSaving}>Cancel</Button>
              <Button onClick={() => onConfirm(editedFPConfig)} isLoading={isSaving}>Save</Button>
            </HStack>
          </Flex>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}


export interface UseConfigureFPModalProps {
  dealId: string;
  documentId: string;
}

export type UseConfigureFPModalReturn = [ReactElement<ConfigureFPModalProps>, () => void, () => void];

export function useConfigureFpModal(
  { dealId, documentId }: UseConfigureFPModalProps,
): UseConfigureFPModalReturn {
  const [isOpen, show, hide] = useIsVisible();
  const updateMutation = useDealDocumentsService().useUpdateFPConfigMutation();
  const toast = useSimpleToast();
  const fpConfigQuery = useDealDocumentsService().useFPConfig(dealId, documentId);
  const fpConfig = fpConfigQuery.data;
  const rentRollDataService = useRentRollDataService();
  const documentData = useDealDocumentsService().useDocumentData(dealId, documentId);

  const fpSqFtConfig = useMemo(() => {
    let fpSqFtConfig = {};
    if (documentData.data) {
      const data: RRFExtractedData = documentData.data.editedData as RRFExtractedData;
      fpSqFtConfig = rentRollDataService.getFPSqFtSummary(data);
    }
    return fpSqFtConfig;
  }, [rentRollDataService, documentData.data]);

  const handleShow = useCallback(async () => {
    await fpConfigQuery.refetch();
    show();
  }, [show, fpConfigQuery]);

  const handleSubmit = useCallback(async (fpConfig: FPConfig) => {
    await updateMutation.mutateAsync({ dealId, documentId, fpConfig }, {
      onSuccess: () => {
        hide();
        toast({
          title: 'Success!',
          description: 'Floor Plan configuration updated.',
        });
      },
    });
  }, [updateMutation, hide, dealId, documentId, toast]);

  const modal = (
    <>
      {fpConfig && isOpen && (
        <ConfigureFPModal
          isOpen={isOpen} onClose={hide} fpConfig={fpConfig} fpSqFtConfig={fpSqFtConfig}
          onConfirm={handleSubmit} isSaving={updateMutation.isLoading}
          documentData={documentData?.data?.editedData as RRFExtractedData}
        />
      )}
    </>
  );

  return [modal, handleShow, hide];
}
