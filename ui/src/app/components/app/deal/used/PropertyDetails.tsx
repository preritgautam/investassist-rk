import React from 'react';
import { FormControl, FormLabel, Input, InputRightAddon, Select, SimpleGrid, VStack } from '@chakra-ui/react';
import { DealDetails } from '../../../../../types';
import { FormNumericInput } from '../../../core/NumericInput';
import { Control, UseFormRegister } from 'react-hook-form';
import { InputGroup } from '@chakra-ui/input';
import { YearInput } from '../../../core/YearInput';
import { FormAmountInput } from '../../../core/AmountInput';
import { BuildingTypes } from '../../../../constant/BuildingType';

export interface PropertyDetailsProps {
  control: Control<DealDetails>;
  register: UseFormRegister<DealDetails>;
}

export function PropertyDetails({ control, register }: PropertyDetailsProps) {
  return (
    <SimpleGrid columns={4} spacingX={12} spacingY={2}>
      <VStack>
        <FormControl>
          <FormLabel>Purchase Price</FormLabel>
          <FormAmountInput name="purchasePrice" control={control}/>
        </FormControl>

        <FormControl>
          <FormLabel>Number of Units</FormLabel>
          <FormNumericInput name="numUnits" control={control} min={1}/>
        </FormControl>

        <FormControl>
          <FormLabel>Number of Buildings</FormLabel>
          <FormNumericInput name="noOfBuildings" control={control}/>
        </FormControl>

        <FormControl>
          <FormLabel>Number of Stories</FormLabel>
          <FormNumericInput name="noOfStories" control={control}/>
        </FormControl>
      </VStack>

      <VStack>
        <FormControl>
          <FormLabel>Parking Spaces</FormLabel>
          <FormNumericInput name="parkingSpaces" control={control}/>
        </FormControl>

        <FormControl>
          <FormLabel>Building Type</FormLabel>
          <Select {...register('buildingType')}>
            <option value={''}>-Select-</option>
            <option value="highRise">{BuildingTypes.highRise}</option>
            <option value="midRise">{BuildingTypes.midRise}</option>
            <option value="lowRise">{BuildingTypes.lowRise}</option>
            <option value="townhouse">{BuildingTypes.townhouse}</option>
            <option value="sfrSubdivision">{BuildingTypes.sfrSubdivision}</option>
          </Select>
        </FormControl>

        <FormControl>
          <FormLabel>Year Built</FormLabel>
          <YearInput minValue={1980} maxValue={2022} {...register('dateBuilt')}/>
        </FormControl>

        <FormControl>
          <FormLabel>Year Renovated</FormLabel>
          <YearInput minValue={1980} maxValue={2022} {...register('dateRenovated')}/>
        </FormControl>
      </VStack>

      <VStack>
        <FormControl>
          <FormLabel>Age Restricted</FormLabel>
          <Select {...register('ageRestricted')}>
            <option value={''}>-Select-</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </Select>
        </FormControl>
        <FormControl>
          <FormLabel>Total Residential Area</FormLabel>
          <FormNumericInput name="totalArea" control={control}/>
        </FormControl>

        <FormControl>
          <FormLabel>Acres</FormLabel>
          <FormNumericInput name="sizeAcres" control={control}/>
        </FormControl>

        <FormControl>
          <FormLabel>Affordable Units %</FormLabel>
          <InputGroup>
            <FormNumericInput name="affordableUnitsPercent" control={control} flexGrow={1} max={100}/>
            <InputRightAddon>%</InputRightAddon>
          </InputGroup>
        </FormControl>
      </VStack>

      <VStack>
        <FormControl>
          <FormLabel>Affordability Status</FormLabel>
          <Select {...register('affordabilityStatus')}>
            <option value={''}>-Select-</option>
            <option value="affordable">Affordable</option>
            <option value="mixedAffordable">Mixed Affordable</option>
            <option value="expiringAffordability">Expiring Affordability</option>
            <option value="market">Market</option>
          </Select>
        </FormControl>

        <FormControl>
          <FormLabel>Asset Quality</FormLabel>
          <Select {...register('assetQuality')}>
            <option value={''}>-Select-</option>
            <option value="A">Class A</option>
            <option value="B">Class B</option>
            <option value="C">Class C</option>
            <option value="D">Class D</option>
          </Select>
        </FormControl>

        <FormControl>
          <FormLabel>Property Manager</FormLabel>
          <Input {...register('propertyManager')}/>
        </FormControl>
      </VStack>


    </SimpleGrid>
  );
}
