import React, { useCallback } from 'react';
import { chakra, ChakraProps, FormControl, FormLabel, HStack, useToast, VStack } from '@chakra-ui/react';
import { requiredLabel } from '../../../../../bootstrap/chakra/components/core/form/RequiredLabel';
import { Input } from '@chakra-ui/input';
import { useApiForm } from '../../../../../bootstrap/hooks/utils/useApiForm';
import { Deal, DealAddress } from '../../../../../types';
import { FormErrors } from '../../../../../bootstrap/chakra/components/core/form/FormErrors';
import { FieldErrorMessage } from '../../../../../bootstrap/chakra/components/core/form/FieldErrorMessage';
import { Fieldset } from '../../../core/Fieldset';
import { FormNumericInput } from '../../../core/NumericInput';
import { useDealService } from '../../../../services/account/user/DealService';
import { BodyXS, HeadingXS } from '../../../../../bootstrap/chakra/components/typography';
import { useMixPanelService } from '../../../../services/MixPanelService';
import { DealAddressField } from '../../deal/DealAddressField';
import { FormYearTextInput } from '../../../core/YearTextInput';

export interface AddDealFormProps extends ChakraProps {
  formId: string,
  onSuccess: (deal: Deal) => void,
}

export function AddDealForm({ formId, onSuccess, ...rest }: AddDealFormProps) {
  const dealService = useDealService();
  const { addDealQuery } = dealService.useQueries();
  const toast = useToast();
  const mixPanelService = useMixPanelService();

  const {
    handleSubmit,
    register,
    formState: { errors },
    formErrors,
    clearFormErrors,
    control,
    setValue,
    watch,
  } = useApiForm<Deal>({
    onSubmit: async (values: Deal) => {
      try {
        const deal = await addDealQuery.mutateAsync(values);
        toast({
          title: <HeadingXS>Success!</HeadingXS>,
          description: <BodyXS>Successfully added deal - {values.name}</BodyXS>,
          status: 'success',
          position: 'top',
          containerStyle: {
            borderRadius: 'xs',
          },
          duration: 3000,
        });
        mixPanelService.trackDealCreatedEvent(deal);
        onSuccess(deal);
      } catch (e) {
        toast({
          title: <HeadingXS>Failed!</HeadingXS>,
          description: <BodyXS>Error in adding deal - {values.name} </BodyXS>,
          status: 'error',
          position: 'top',
          containerStyle: {
            borderRadius: 'xs',
          },
          duration: 3000,
        });
      }
    },
  });

  const [addressValue] = watch(['address']);

  const handleAddressChange = useCallback((value: DealAddress) => {
    setValue('address', value);
    setValue('name', value.line1);
  }, [setValue]);

  return (
    <chakra.form id={formId} {...rest} onSubmit={handleSubmit}>
      <VStack>
        <FormErrors errors={formErrors} onClose={clearFormErrors}/>

        <DealAddressField
          value={addressValue} onChange={handleAddressChange} errors={errors.address}
          wrapperProps={{ alignSelf: 'stretch' }}
          dealNameField={(
            <FormControl>
              <FormLabel>Deal Name{requiredLabel}</FormLabel>
              <Input {...register('name', {
                required: 'Please provide a deal name',
              })}/>
              <FieldErrorMessage error={errors.name}/>
            </FormControl>
          )}
        />

        <>
          <Fieldset label={<>Deal Details{requiredLabel}</>}>
            <HStack align="flex-start">
              <FormControl>
                <FormLabel>Number of Units{requiredLabel}</FormLabel>
                <FormNumericInput
                  control={control} name="details.numUnits" min={1}
                  rules={{
                    required: 'Please provide number of units',
                  }}
                />
                <FieldErrorMessage error={errors?.details?.numUnits}/>
              </FormControl>

              <FormControl>
                <FormLabel>Year Built{requiredLabel}</FormLabel>
                <FormYearTextInput
                  control={control} name="details.dateBuilt"
                  rules={{
                    required: `Please select when the property was built`,
                  }}
                  min={1900} max={new Date().getFullYear()}
                />
                <FieldErrorMessage error={errors?.details?.dateBuilt}/>
              </FormControl>
            </HStack>
          </Fieldset>
        </>
      </VStack>
    </chakra.form>
  );
}
