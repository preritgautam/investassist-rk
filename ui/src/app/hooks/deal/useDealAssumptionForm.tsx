import { useDealService } from '../../services/account/user/DealService';
import { Assumption, Deal } from '../../../types';
import React, { ReactElement, useCallback, useEffect, useState } from 'react';
import { useSimpleToast } from '../utils/useSimpleToast';
import { AssumptionForm, AssumptionFormProps } from '../../components/app/forms/assumption/AssumptionForm';

type DealAssumptionFormValues = Omit<Assumption, 'name'>;

interface UseDealAssumptionFormProps {
  formId: string;
  deal: Deal | null;
}

type UseDealAssumptionFormReturn =
  [ReactElement<AssumptionFormProps>, Assumption, (values: DealAssumptionFormValues) => void, boolean];

export function useDealAssumptionForm({ formId, deal }: UseDealAssumptionFormProps): UseDealAssumptionFormReturn {
  const dealService = useDealService();
  const dealAssumption: Assumption | null = dealService.useDealAssumption(deal?.id, {
    refetchOnReconnect: false,
    refetchInterval: false,
    refetchOnWindowFocus: false,
    refetchIntervalInBackground: false,
  }).data;

  const [formValues, setFormValues] = useState(null);

  useEffect(() => {
    setFormValues(dealAssumption);
  }, [dealAssumption]);

  const updateAssumptionMutation = dealService.useUpdateDealAssumption(deal?.id);
  const toast = useSimpleToast();
  const handleSave = useCallback(async (values: DealAssumptionFormValues) => {
    await updateAssumptionMutation.mutateAsync({ ...values, name: 'Deal Assumption' }, {
      onSuccess: () => toast({
        description: 'Updated deal assumption',
        title: 'Success!',
        status: 'success',
      }),
    });
  }, [updateAssumptionMutation, toast]);

  const form = (
    <AssumptionForm
      formId={formId} onSave={handleSave} defaultValues={formValues} dealAssumptions
    />
  );

  return [form, dealAssumption, setFormValues, updateAssumptionMutation.isLoading];
}
