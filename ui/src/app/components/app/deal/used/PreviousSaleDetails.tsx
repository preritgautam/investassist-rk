import React from 'react';
import { FormControl, FormLabel, SimpleGrid } from '@chakra-ui/react';
import { Control, UseFormRegister } from 'react-hook-form';
import { DealDetails } from '../../../../../types';
import { DateInput } from '../../../core/DateInput';
import { FormAmountInput } from '../../../core/AmountInput';

export interface PreviousSaleDetailsProps {
  control: Control<DealDetails>;
  register: UseFormRegister<DealDetails>;
}

export function PreviousSaleDetails({ register, control }: PreviousSaleDetailsProps) {
  return (
    <SimpleGrid columns={4} spacingX={12} spacingY={2}>
      <FormControl>
        <FormLabel>Last Sale Date</FormLabel>
        <DateInput {...register('lastSaleDate')}/>
      </FormControl>

      <FormControl>
        <FormLabel>Last Sale Price</FormLabel>
        <FormAmountInput name="lastSalePrice" control={control}/>
      </FormControl>
    </SimpleGrid>
  );
}
