import React from 'react';
import { FormControl, FormLabel, Input, InputRightAddon, SimpleGrid } from '@chakra-ui/react';
import { Control, UseFormRegister } from 'react-hook-form';
import { DealDetails } from '../../../../../types';
import { FormAmountInput } from '../../../core/AmountInput';
import { MonthInput } from '../../../core/MonthInput';
import { InputGroup } from '@chakra-ui/input';
import { FormNumericInput } from '../../../core/NumericInput';

export interface TransactionDetailsProps {
  control: Control<DealDetails>;
  register: UseFormRegister<DealDetails>;
}

export function TransactionDetails({ control, register }: TransactionDetailsProps) {
  return (
    <SimpleGrid columns={4} spacingX={12} spacingY={2}>
      <FormControl>
        <FormLabel>Sale Price</FormLabel>
        <FormAmountInput name="salePrice" control={control}/>
      </FormControl>

      <FormControl>
        <FormLabel>Sale Date</FormLabel>
        <MonthInput {...register('saleDate')}/>
      </FormControl>

      <FormControl>
        <FormLabel>Cap Rate (Trailing)</FormLabel>
        <InputGroup>
          <FormNumericInput name="capRateTrailing" control={control} flexGrow={1} max={100}/>
          <InputRightAddon>%</InputRightAddon>
        </InputGroup>
      </FormControl>

      <FormControl>
        <FormLabel>NOI (Trailing 12)</FormLabel>
        <FormAmountInput name="noiTrailing12" control={control}/>
      </FormControl>

      <FormControl>
        <FormLabel>Buyer</FormLabel>
        <Input {...register('buyer')}/>
      </FormControl>

      <FormControl>
        <FormLabel>Seller</FormLabel>
        <Input {...register('seller')}/>
      </FormControl>

      <FormControl>
        <FormLabel>Broker</FormLabel>
        <Input {...register('broker')}/>
      </FormControl>
    </SimpleGrid>
  );
}
