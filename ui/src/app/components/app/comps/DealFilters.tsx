import React, { useCallback, useEffect } from 'react';
import {
  Button, ButtonProps,
  Flex, InputLeftAddon,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  Select, Text,
} from '@chakra-ui/react';
import { BuildingType } from '../../../../types';
import { Input, InputGroup } from '@chakra-ui/input';
import { useMap } from 'react-use';
import { FlexCol } from '../../../../bootstrap/chakra/components/layouts/FlexCol';
import { NumericInput } from '../../core/NumericInput';
import { MenuDownIcon } from '../icons';
import { BuildingTypes } from '../../../constant/BuildingType';

export interface Filters {
  name?: string;
  city?: string;
  zip?: string;
  noOfUnits?: {
    min?: number;
    max?: number;
  };
  buildingType?: BuildingType;
  yearBuilt?: {
    min?: number;
    max?: number;
  };
  yearRenovated?: {
    min?: number;
    max?: number;
  };
}


export interface NumberRangeFieldPopoverProps {
  minValue?: number;
  maxValue?: number;
  onChange: (startYear: number, endYear: number) => void;
  size: ButtonProps['size'],
}

function NumberRangeFieldPopover({ minValue, maxValue, onChange, size }: NumberRangeFieldPopoverProps) {
  const handleChange = useCallback((startOrEnd: string, value: string) => {
    let start = minValue;
    let end = maxValue;
    if (startOrEnd === 'start') {
      start = value === '' ? undefined : parseInt(value);
    } else {
      end = value === '' ? undefined : parseInt(value);
    }
    onChange(start, end);
  }, [minValue, maxValue, onChange]);

  const label = `${minValue ?? '____'} - ${maxValue ?? '____'}`;

  return (
    <Popover closeOnEsc closeOnBlur>
      <PopoverTrigger>
        <Button
          flexShrink={0} size={size} variant="outline" w={28}
          rightIcon={<MenuDownIcon/>}
        >{label}</Button>
      </PopoverTrigger>
      <PopoverContent w={64}>
        <PopoverArrow/>
        <PopoverBody>
          <FlexCol p={1} w="full">
            <InputGroup>
              <InputLeftAddon>
                <Text w={8}>Start</Text>
              </InputLeftAddon>
              <NumericInput
                value={minValue ?? ''} dontFormat
                onChange={(strValue) => handleChange('start', strValue)}
              />
            </InputGroup>
            <InputGroup>
              <InputLeftAddon>
                <Text w={8}>End</Text>
              </InputLeftAddon>
              <NumericInput
                value={maxValue ?? ''} dontFormat
                onChange={(strValue) => handleChange('end', strValue)}
              />
            </InputGroup>
          </FlexCol>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
}


export interface DealFiltersProps {
  onFiltersChanged: (filters: Filters) => void;
}

export function DealFilters({ onFiltersChanged }: DealFiltersProps) {
  const [filters, { set, remove, reset }] = useMap<Filters>({});

  const handleTextFieldChange = useCallback((fieldName: keyof Filters, fieldValue: string) => {
    if (fieldValue === '') {
      remove(fieldName);
    } else {
      set(fieldName, fieldValue);
    }
  }, [set, remove]);


  const handleNumberRangeFieldChange = useCallback(
    (fieldName: keyof Filters, minValue?: number, maxValue?: number) => {
      if (minValue === undefined && maxValue === undefined) {
        remove(fieldName);
      } else if (minValue === undefined) {
        set(fieldName, { max: maxValue });
      } else if (maxValue === undefined) {
        set(fieldName, { min: minValue });
      } else {
        set(fieldName, { min: minValue, max: maxValue });
      }
    }, [set, remove],
  );

  useEffect(() => {
    onFiltersChanged(filters);
  }, [filters, onFiltersChanged]);

  return (
    <>
      <Flex gap={2} alignItems="center" mb={4}>
        <FlexCol p={1}>
          <Text fontSize="xs">Name</Text>
          <Input
            placeholder="Deal/Property Name" size="xs" value={filters?.name ?? ''}
            onChange={(e) => handleTextFieldChange('name', e.target.value)}
          />
        </FlexCol>
        <FlexCol p={1}>
          <Text fontSize="xs">City</Text>
          <Input
            placeholder="City" size="xs" value={filters?.city ?? ''}
            onChange={(e) => handleTextFieldChange('city', e.target.value)}
          />
        </FlexCol>
        <FlexCol p={1}>
          <Text fontSize="xs">Zip</Text>
          <Input
            placeholder="Zip" size="xs" value={filters?.zip ?? ''}
            onChange={(e) => handleTextFieldChange('zip', e.target.value)}
          />
        </FlexCol>
        <FlexCol p={1}>
          <Text fontSize="xs"># Units</Text>
          <NumberRangeFieldPopover
            size="xs"
            minValue={filters?.noOfUnits?.min} maxValue={filters?.noOfUnits?.max}
            onChange={(min, max) => handleNumberRangeFieldChange('noOfUnits', min, max)}
          />
        </FlexCol>
        <FlexCol p={1}>
          <Text fontSize="xs">Building Type</Text>
          <Select
            size="xs" value={filters?.buildingType ?? ''}
            onChange={(e) => handleTextFieldChange('buildingType', e.target.value)}
          >
            <option value={''}>-Select Building Type-</option>
            <option value="highRise">{BuildingTypes.highRise}</option>
            <option value="midRise">{BuildingTypes.midRise}</option>
            <option value="lowRise">{BuildingTypes.lowRise}</option>
            <option value="townhouse">{BuildingTypes.townhouse}</option>
            <option value="sfrSubdivision">{BuildingTypes.sfrSubdivision}</option>
          </Select>
        </FlexCol>
        <FlexCol p={1}>
          <Text fontSize="xs">Year Built</Text>
          <NumberRangeFieldPopover
            size="xs"
            minValue={filters?.yearBuilt?.min} maxValue={filters?.yearBuilt?.max}
            onChange={(startYear, endYear) => handleNumberRangeFieldChange('yearBuilt', startYear, endYear)}
          />
        </FlexCol>
        <FlexCol p={1}>
          <Text fontSize="xs">Year Renovated</Text>
          <NumberRangeFieldPopover
            size="xs"
            minValue={filters?.yearRenovated?.min} maxValue={filters?.yearRenovated?.max}
            onChange={(startYear, endYear) => handleNumberRangeFieldChange('yearRenovated', startYear, endYear)}
          />
        </FlexCol>
        <FlexCol p={1} justifyContent="flex-end" alignSelf="stretch" h="50px">
          <Text fontSize="xs">&nbsp;</Text>
          <Button size="xs" onClick={reset} flexShrink={0}>Clear All</Button>
        </FlexCol>
      </Flex>
    </>
  );
}
