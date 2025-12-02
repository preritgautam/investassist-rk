import { Box, Checkbox, Flex, Icon, IconButton, Input, Select, Text, VStack } from '@chakra-ui/react';
import { RRColumnMenu } from './RRColumnMenu';
import { FixedColumnConfigureButton } from './FixedColumnConfigureButton';
import { RRFAdditionalDetailsField } from './RRFAdditionalDetailsField';
import { ChargeCodeField } from './ChargeCodeField';
import React, { useCallback, useRef } from 'react';
import {
  DealDocument,
  RentRollExtraData,
  RRFDataColumn,
  RRFDataFieldType,
  RRFExtractedData,
} from '../../../../../../../types';
import { RRFUnitInformationField } from './RRFUnitInformationField';
import { RRFLeaseTermsField } from './RRFLeaseTermsField';
import { IHeaderParams } from 'ag-grid-community';
import { FilterIcon } from '../../../../icons';

interface RRFDataColumnHeaderProps extends IHeaderParams {
  dealId: string;
  document: DealDocument;
  columnData: RRFDataColumn;
  onChange: (value: RRFDataColumn) => void;
  onAddColumnAfter: (column: RRFDataColumn) => void;
  onAddColumnBefore: (column: RRFDataColumn) => void;
  onDeleteColumn: (column: RRFDataColumn) => void;
  data: RRFExtractedData;
  extraData: RentRollExtraData;
  onValuesUpdate: (column: RRFDataColumn, values: any[]) => void;
  readonly: boolean;
}

export function RRFDataColumnHeader(
  {
    dealId,
    document,
    columnData,
    onChange,
    onAddColumnAfter,
    onAddColumnBefore,
    onDeleteColumn,
    data,
    extraData,
    onValuesUpdate,
    enableMenu,
    showColumnMenu,
    column,
    readonly,
  }: RRFDataColumnHeaderProps,
) {
  const { key, type, name, discard } = columnData;
  const handleDiscard = (e) => onChange({ ...columnData, discard: !e.target.checked });
  const handleNameChange = (newName) => {
    if (typeof newName === 'string') {
      onChange({ ...columnData, name: newName });
    } else {
      onChange({ ...columnData, name: newName.target.value });
    }
  };
  const handleTypeChange = (e) => {
    const type = e.target.value as RRFDataFieldType;

    const previousType = columnData.type;
    const updatedColumn = { ...columnData };
    if (type === 'chargeCode' && previousType !== 'chargeCode') {
      updatedColumn.type = type;
      updatedColumn.originalName = updatedColumn.name;
      updatedColumn.name = updatedColumn.header;
    } else if (previousType === 'chargeCode' && type !== 'chargeCode') {
      updatedColumn.type = type;
      updatedColumn.name = updatedColumn.originalName ?? updatedColumn.name;
    } else {
      updatedColumn.type = type;
    }
    onChange(updatedColumn);
  };
  const colName = `Column ${parseInt(key.substring(3)) + 1}`;

  const filterButtonRef = useRef(null);
  const handleFilter = useCallback(() => {
    showColumnMenu(filterButtonRef.current);
  }, [filterButtonRef, showColumnMenu]);

  const isFilterActive = column.isFilterActive();

  return (
    <VStack align="stretch" spacing={1} w="100%" justifyContent="flex-start">
      <Flex justify="space-between">
        <Checkbox
          isChecked={!discard} onChange={handleDiscard} size="sm" isReadOnly={readonly}
          colorScheme={readonly ? 'gray' : 'primary'}
        >
          <Text fontSize="xs">{colName}</Text>
        </Checkbox>
        <Flex>
          {enableMenu && (
            <IconButton
              ref={filterButtonRef} onClick={handleFilter}
              variant="ghost" size="xs" aria-label="column filter"
              icon={<Icon as={FilterIcon} fontSize={10}/>}
              // colorScheme="gray"
              colorScheme={isFilterActive ? 'warning' : 'gray'}
              isActive={isFilterActive}
            />
          )}
          <RRColumnMenu
            column={columnData} onAddColumnBefore={onAddColumnBefore} onAddColumnAfter={onAddColumnAfter}
            onDeleteColumn={onDeleteColumn} readonly={readonly}
          />
        </Flex>
      </Flex>

      <>
        {type !== 'fixed' && (
          <Select
            size="xs" onChange={handleTypeChange} value={type} isDisabled={readonly}
            color={readonly ? 'black' : undefined}
          >
            <option value="unitInformation">Unit Information</option>
            <option value="leaseTerms">Lease Terms</option>
            <option value="chargeCode">Tenant Charges</option>
            <option value="additionalDetails">Additional Details</option>
          </Select>
        )}
        {type === 'fixed' && (
          <FixedColumnConfigureButton
            dealId={dealId} document={document}
            column={columnData} data={data} floorPlanConfig={extraData.floorPlanConfig}
            chargeCodeConfig={extraData.chargeCodeConfig}
            onValuesUpdate={onValuesUpdate} isDisabled={readonly}
          />
        )}
      </>

      <>
        {type === 'fixed' && (
          <Text fontSize="xs" lineHeight={6} pl={2}>{name}</Text>
        )}
        {type === 'unitInformation' && (
          <RRFUnitInformationField
            value={name} onChange={handleNameChange} fontWeight="bold"
            isDisabled={readonly} color={readonly ? 'black' : undefined}
          />
        )}
        {type === 'leaseTerms' && (
          <RRFLeaseTermsField
            value={name} onChange={handleNameChange} fontWeight="bold"
            isDisabled={readonly} color={readonly ? 'black' : undefined}
          />
        )}
        {type === 'additionalDetails' && (
          <>
            <RRFAdditionalDetailsField
              value={name} onChange={handleNameChange} fontWeight="bold"
              isDisabled={readonly} color={readonly ? 'black' : undefined}
            />
          </>
        )}
        {type === 'chargeCode' && (
          <ChargeCodeField
            value={name} onChange={handleNameChange} fontWeight="bold" size="xs"
            isDisabled={readonly} color={readonly ? 'black' : undefined}
          />
        )}
      </>
      <>
        {columnData.header && (
          <Input isReadOnly={true} value={columnData.header} size="xs" style={{ color: '#666' }}/>
        )}
        {!columnData.header && (
          <Box h={6}/>
        )}
      </>
    </VStack>
  );
}
