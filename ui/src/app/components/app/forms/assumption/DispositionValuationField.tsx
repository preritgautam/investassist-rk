import { GroupFieldProps } from './types';
import { FormControl, FormControlProps, FormLabel, HStack } from '@chakra-ui/react';
import { SelectField } from './SelectField';
import { AmountField } from './AmountField';
import React from 'react';
import { DispositionValuationModel } from '../../../../enums/DispositionValuationModel';
import { AssumptionFormMode } from './AssumptionForm';

interface DispositionValuationFieldProps extends GroupFieldProps<'DA_DispositionValuation'>, FormControlProps {
  mode: AssumptionFormMode;
}

export function DispositionValuationField(
  { register, control, error, watch, isDisabled=false, mode, ...rest }: DispositionValuationFieldProps,
) {
  const [valuation] = watch(['DA_DispositionValuation']);
  const type = valuation?.type;

  return (
    <FormControl {...rest}>
      <FormLabel>Disposition Valuation</FormLabel>
      <HStack>
        <SelectField
          options={DispositionValuationModel.allMap()} register={register} name="DA_DispositionValuation.type"
          error={error?.type} isDisabled={isDisabled}
        />
        {mode === 'pro' && (
          <AmountField
            control={control} name="DA_DispositionValuation.value" error={error?.value}
            inputProps={{ isDisabled: !type || isDisabled }}
          />
        )}
      </HStack>
    </FormControl>
  );
}
