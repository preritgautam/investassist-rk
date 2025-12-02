import React from 'react';
import { FormControl, FormLabel, SimpleGrid } from '@chakra-ui/react';
import { DealDetails } from '../../../../../types';
import { Control, UseFormRegister } from 'react-hook-form';
import { DateInput } from '../../../core/DateInput';
import { FormAmountInput } from '../../../core/AmountInput';

export interface DealDetailsProps {
  register: UseFormRegister<DealDetails>;
  control: Control<DealDetails>;
}

export function DealProperties({ register, control }: DealDetailsProps) {
  return (
    <SimpleGrid columns={4} spacingX={12} spacingY={2}>
      <FormControl>
        <FormLabel>Bid Due Date</FormLabel>
        <DateInput {...register('bidDueDate')} />
      </FormControl>

      <FormControl>
        <FormLabel>Start of Operations</FormLabel>
        <DateInput {...register('startOfOperations')}/>
      </FormControl>

      <FormControl>
        <FormLabel>Fund</FormLabel>
        <FormAmountInput name="fund" control={control}/>
      </FormControl>
    </SimpleGrid>
  );
}
