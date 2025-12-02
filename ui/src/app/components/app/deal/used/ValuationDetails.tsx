import React from 'react';
import { FormControl, FormLabel, InputRightAddon, SimpleGrid } from '@chakra-ui/react';
import { Control } from 'react-hook-form';
import { DealDetails } from '../../../../../types';
import { FormAmountInput } from '../../../core/AmountInput';
import { FormNumericInput } from '../../../core/NumericInput';
import { InputGroup } from '@chakra-ui/input';

export interface ValuationDetailsProps {
  control: Control<DealDetails>;
}

export function ValuationDetails({ control }: ValuationDetailsProps) {
  return (
    <SimpleGrid columns={4} spacingX={12} spacingY={2}>
      <FormControl>
        <FormLabel>Expected Purchase Price</FormLabel>
        <FormAmountInput name="expectedPurchasePrice" control={control}/>
      </FormControl>

      <FormControl>
        <FormLabel>Equity Multiple</FormLabel>
        <FormNumericInput name="equityMultiple" control={control}/>
      </FormControl>

      <FormControl>
        <FormLabel>Required Equity</FormLabel>
        <FormAmountInput name="requiredEquity" control={control}/>
      </FormControl>

      <FormControl>
        <FormLabel>Leveraged IRR</FormLabel>
        <FormNumericInput name="leveragedIRR" control={control}/>
      </FormControl>

      <FormControl>
        <FormLabel>Going-In-Cap Rate (Fwd.)</FormLabel>
        <InputGroup>
          <FormNumericInput name="goingInCapRateFwd" control={control} flexGrow={1}/>
          <InputRightAddon>%</InputRightAddon>
        </InputGroup>
      </FormControl>
    </SimpleGrid>
  );
}
