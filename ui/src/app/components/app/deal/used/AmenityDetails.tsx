import React from 'react';
import { SimpleGrid } from '@chakra-ui/react';
import { Control } from 'react-hook-form';
import { DealDetails } from '../../../../../types';
import { FormCheckbox } from '../../../core/FormCheckbox';

export interface AmenityDetailsProps {
  control: Control<DealDetails>;
}


export function AmenityDetails({ control }: AmenityDetailsProps) {
  return (
    <SimpleGrid columns={4} spacingX={12} spacingY={2}>
      <FormCheckbox control={control} name="hasElevator">Elevator</FormCheckbox>
      <FormCheckbox control={control} name="hasFitnessCenter">Fitness Center</FormCheckbox>
      <FormCheckbox control={control} name="hasDoorman">Doorman</FormCheckbox>
      <FormCheckbox control={control} name="hasPool">Pool</FormCheckbox>
      <FormCheckbox control={control} name="hasWaterFront">Water Front</FormCheckbox>
      <FormCheckbox control={control} name="hasSpa">Spa</FormCheckbox>
      <FormCheckbox control={control} name="hasRoofDeck">Roof Deck</FormCheckbox>
      <FormCheckbox control={control} name="hasOtherAmenities">Other</FormCheckbox>
    </SimpleGrid>
  );
}
