import { GroupFieldProps } from './types';
import { FormControl, FormControlProps, FormLabel, HStack } from '@chakra-ui/react';
import { UseFormWatch } from 'react-hook-form';
import { Assumption } from '../../../../../types';
import { AcquisitionValuationModel } from '../../../../enums/AcquisitionValuationModel';
import { SelectField } from './SelectField';
import { AmountField } from './AmountField';
import { PercentField } from './PercentField';
import { NumericField } from './NumericField';
import React from 'react';
import { AssumptionFormMode } from './AssumptionForm';

interface AcquisitionValuationFieldProps extends GroupFieldProps<'AA_AcquisitionValuation'>, FormControlProps {
  watch: UseFormWatch<Assumption>;
  mode: AssumptionFormMode,
}

export function AcquisitionValuationField(
  {
    register, control, error, watch,
    isDisabled = false, mode, ...rest
  }: AcquisitionValuationFieldProps) {
  const [valuation] = watch(['AA_AcquisitionValuation']);
  const type = valuation?.type;
  const valueType = AcquisitionValuationModel.get(type)?.valueType;

  const isPro = mode === 'pro';
  const isSyn = mode === 'syn';

  return (
    <FormControl {...rest}>
      <FormLabel>Acquisition Valuation</FormLabel>
      <HStack>
        <SelectField
          options={(
            isPro ? AcquisitionValuationModel.allMap() :
              isSyn ?
                { [AcquisitionValuationModel.ProformaCapRate.key]: AcquisitionValuationModel.ProformaCapRate.label } :
                []
          )}
          register={register} name="AA_AcquisitionValuation.type"
          error={error?.type} isDisabled={isDisabled}
        />
        {valueType === '$' && (
          <AmountField
            control={control} name="AA_AcquisitionValuation.value" error={error?.value}
            isDisabled={isDisabled}/>
        )}
        {valueType === '%' && (
          <PercentField
            control={control} name="AA_AcquisitionValuation.value" error={error?.value}
            isDisabled={isDisabled}/>
        )}
        {valueType === '#' && (
          <NumericField
            control={control} name="AA_AcquisitionValuation.value" error={error?.value}
            isDisabled={isDisabled}/>
        )}
        {!valueType && (
          <AmountField
            control={control} name="AA_AcquisitionValuation.value" error={error?.value}
            inputProps={{ isDisabled: true }}
          />
        )}
      </HStack>
    </FormControl>
  );
}
