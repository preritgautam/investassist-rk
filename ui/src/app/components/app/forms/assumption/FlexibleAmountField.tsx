import { GroupFieldProps } from './types';
import { FormControl, FormControlProps, FormLabel, HStack } from '@chakra-ui/react';
import { Assumption, FlexibleAmount } from '../../../../../types';
import { FlexibleAmountType } from '../../../../enums/FlexibleAmountType';
import { SelectField } from './SelectField';
import { AmountField } from './AmountField';
import { PercentField } from './PercentField';
import React from 'react';
import { FieldPath } from 'react-hook-form';

interface FlexibleAmountFieldProps extends GroupFieldProps<any>, FormControlProps {
  name: keyof Assumption;
  label: string;
  disableType?: boolean;
  restrictOptions?: FlexibleAmountType[];
}

export function FlexibleAmountField(
  {
    label, watch, disableType,
    register, control, name, error, restrictOptions,
    ...rest
  }: FlexibleAmountFieldProps) {
  const [fieldValue] = watch([name]) as [FlexibleAmount];
  const type = fieldValue?.type;
  const valueType = FlexibleAmountType.get(type)?.valueType;

  return (
    <FormControl {...rest}>
      <FormLabel>{label}</FormLabel>
      <HStack>
        <SelectField
          options={restrictOptions ? FlexibleAmountType.getMap(restrictOptions) : FlexibleAmountType.allMap()}
          register={register}
          name={`${name}.type` as FieldPath<Assumption>} error={error?.type}
          selectProps={{ isDisabled: disableType }}
        />
        {valueType === '$' && (
          <AmountField
            control={control} name={`${name}.value` as FieldPath<Assumption>} error={error?.value}
            isDisabled={disableType}/>
        )}
        {valueType === '%' && (
          <PercentField
            control={control} name={`${name}.value` as FieldPath<Assumption>} error={error?.value}
            isDisabled={disableType}/>
        )}
        {valueType === undefined && (
          <AmountField
            control={control} name={`${name}.value` as FieldPath<Assumption>} error={error?.value}
            inputProps={{ isDisabled: true }}
          />
        )}
      </HStack>
    </FormControl>
  );
}
