import { chakra, HStack, HTMLChakraProps, SimpleGrid, Text, VStack } from '@chakra-ui/react';
import React, { ReactNode, useEffect } from 'react';
import { Assumption } from '../../../../../types';
import { useApiForm } from '../../../../../bootstrap/hooks/utils/useApiForm';
import { FormErrors } from '../../../../../bootstrap/chakra/components/core/form/FormErrors';
import { FlexCol } from '../../../../../bootstrap/chakra/components/layouts/FlexCol';
import { TextField } from './TextField';
import { YearsField } from './YearsField';
import { ISODateField } from './ISODateField';
import { PercentField } from './PercentField';
import { AmountField } from './AmountField';
import { CheckboxField } from './CheckboxField';
import { AcquisitionValuationField } from './AcquisitionValuationField';
import { AssumptionsSection } from './AssumptionsSection';
import { DispositionValuationField } from './DispositionValuationField';
import { FlexibleAmountField } from './FlexibleAmountField';
import { RadioField } from './RadioField';
import { FlexibleAmountType } from '../../../../enums/FlexibleAmountType';
import { userSession } from '../../../../../userSession';


interface FieldGroupProps extends HTMLChakraProps<'fieldset'> {
  title: string;
  children: ReactNode;
}

function FieldGroup({ title, children, ...rest }: FieldGroupProps) {
  return (
    <chakra.fieldset p={4} border="1px solid" borderColor="border.500" rounded="sm" {...rest}>
      <legend>
        <Text fontSize="xs">{title}</Text>
      </legend>
      {children}
    </chakra.fieldset>
  );
}

export type AssumptionFormMode = 'pro' | 'syn';

export interface AssumptionFormProps {
  defaultValues?: Assumption;
  formId: string;
  onSave: (values: Assumption) => void;
  dealAssumptions?: boolean;
  disabled?: boolean;
}

export function AssumptionForm(
  { defaultValues, formId, onSave, dealAssumptions, disabled = false }: AssumptionFormProps,
) {
  const {
    handleSubmit,
    register,
    formErrors,
    clearFormErrors,
    formState: { errors },
    control,
    reset,
    watch,
  } = useApiForm<Assumption>({
    defaultValues,
    onSubmit: async (values: Assumption) => {
      await onSave(values);
      reset(values);
    },
  });

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  const { user: { accountDetails } } = userSession.useAuthManager();
  const formMode: AssumptionFormMode = accountDetails.planId === 'plan1' ? 'syn' : 'pro';

  const isPro = formMode === 'pro';
  const isSyn = formMode === 'syn';

  return (
    <chakra.form id={formId} onSubmit={handleSubmit} minH={0} overflow="auto" pr={8} mr={-8}>
      <FormErrors errors={formErrors} onClose={clearFormErrors}/>
      <FlexCol gap={4}>
        {!dealAssumptions && (
          <TextField label="Name" register={register} name="name" error={errors.name} isDisabled={disabled}/>
        )}

        <FlexCol py={4} pt={0} className="no-scrollbar">
          <VStack align="stretch" spacing={8}>
            <AssumptionsSection title="Deal Details">
              <VStack>
                <YearsField
                  label="Hold Period" control={control}
                  name="DD_HoldPeriodYears" error={errors.DD_HoldPeriodYears}
                  isDisabled={disabled}
                />
                {dealAssumptions && (
                  <ISODateField
                    label="Closing Date" register={register}
                    name="DD_ClosingDate" error={errors.DD_ClosingDate}
                    isDisabled={disabled}
                  />
                )}
              </VStack>
            </AssumptionsSection>

            <AssumptionsSection title="Acquisition & Disposition">
              <HStack align="stretch" flexGrow={1}>
                <FieldGroup title="Acquisition" flexGrow={1}>
                  <AcquisitionValuationField
                    watch={watch} control={control} register={register} error={errors.AA_AcquisitionValuation}
                    isDisabled={disabled} mode={formMode}
                  />
                </FieldGroup>

                <FieldGroup title="Disposition" flexGrow={1}>
                  <VStack>
                    <DispositionValuationField
                      watch={watch} control={control} register={register} error={errors.DA_DispositionValuation}
                      isDisabled={disabled} mode={formMode}
                    />
                    <PercentField
                      label="Terminal Cap Rate" control={control}
                      name="DA_TerminalCapRate" error={errors.DA_TerminalCapRate}
                      isDisabled={disabled}
                    />
                  </VStack>
                </FieldGroup>
              </HStack>
            </AssumptionsSection>

            <AssumptionsSection title="MTM Units">
              <SimpleGrid columns={4} spacingX={12} spacingY={2}>
                <RadioField
                  label="Treat MTM Units as" control={control} options={['Occupied', 'Vacant']}
                  name="MTMUnitsStatus" error={errors.MTMUnitsStatus}
                  isDisabled={disabled}
                />
              </SimpleGrid>
            </AssumptionsSection>

            <AssumptionsSection title="Closing Costs">
              <SimpleGrid columns={4} spacingX={12} spacingY={2}>
                <PercentField
                  label="Transfer Tax" control={control}
                  name="CC_TransferTax" error={errors.CC_TransferTax}
                  isDisabled={disabled}
                />
                <PercentField
                  label="Broker Commission" control={control}
                  name="CC_BrokerCommission" error={errors.CC_BrokerCommission}
                  isDisabled={disabled}
                />
                <PercentField
                  label="Other Closing Costs" control={control}
                  name="CC_OtherClosingCosts" error={errors.CC_OtherClosingCosts}
                  isDisabled={disabled}
                />
              </SimpleGrid>
            </AssumptionsSection>

            <AssumptionsSection title="Other Closing Costs Details">
              <SimpleGrid columns={4} spacingX={12} spacingY={2}>
                <AmountField
                  label="PCA Report" control={control}
                  name="OCC_PCAReport" error={errors.OCC_PCAReport}
                  isDisabled={disabled}
                />
                <AmountField
                  label="Environmental Reports" control={control}
                  name="OCC_EnvironmentalReports" error={errors.OCC_EnvironmentalReports}
                  isDisabled={disabled}
                />
                <AmountField
                  label="Other Due Diligence" control={control}
                  name="OCC_OtherDueDiligence" error={errors.OCC_OtherDueDiligence}
                  isDisabled={disabled}
                />
                <AmountField
                  label="Back Due Property Taxes" control={control}
                  name="OCC_BackDuePropertyTaxes" error={errors.OCC_BackDuePropertyTaxes}
                  isDisabled={disabled}
                />
                <AmountField
                  label="Outstanding Liens" control={control}
                  name="OCC_OutstandingLiens" error={errors.OCC_OutstandingLiens}
                  isDisabled={disabled}
                />
                <AmountField
                  label="Other Assumed Liabilities" control={control}
                  name="OCC_OtherAssumedLiabilities" error={errors.OCC_OtherAssumedLiabilities}
                  isDisabled={disabled}
                />
                <PercentField
                  label="Title Insurance (BPS)" control={control}
                  name="OCC_TitleInsuranceBPS" error={errors.OCC_TitleInsuranceBPS}
                  isDisabled={disabled}
                />
                <AmountField
                  label="Legal Fees" control={control}
                  name="OCC_LegalFees" error={errors.OCC_LegalFees}
                  isDisabled={disabled}
                />
                <AmountField
                  label="ALTA Survey" control={control}
                  name="OCC_ALTASurvey" error={errors.OCC_ALTASurvey}
                  isDisabled={disabled}
                />
                <AmountField
                  label="Deferred Maintenance" control={control}
                  name="OCC_DeferredMaintenance" error={errors.OCC_DeferredMaintenance}
                  isDisabled={disabled}
                />
                <PercentField
                  label="Finder's Fees (BPS)" control={control}
                  name="OCC_FindersFeesBPS" error={errors.OCC_FindersFeesBPS}
                  isDisabled={disabled}
                />
                <AmountField
                  label="Prepayment Penalty" control={control}
                  name="OCC_PrepaymentPenalty" error={errors.OCC_PrepaymentPenalty}
                  isDisabled={disabled}
                />
                <AmountField
                  label="Other Misc. Closing Costs" control={control}
                  name="OCC_OtherMiscClosingCosts" error={errors.OCC_OtherMiscClosingCosts}
                  isDisabled={disabled}
                />
              </SimpleGrid>
            </AssumptionsSection>

            <AssumptionsSection title="Upfront Funding">
              <CheckboxField
                label="Upfront Funding" control={control}
                name="upfrontFunding" error={errors.upfrontFunding}
                isDisabled={disabled}
              />
            </AssumptionsSection>

            <AssumptionsSection title="Increment and Inflation (Annual)">
              <HStack align="stretch">
                <FieldGroup title="Rent Increment" flexGrow={2}>
                  <SimpleGrid columns={3} spacingX={12} spacingY={2}>
                    <PercentField
                      label="Rent Increment" control={control}
                      name="IIA_RI_RentIncrement" error={errors.IIA_RI_RentIncrement}
                      isDisabled={disabled}
                    />

                    {isPro && (
                      <>
                        <PercentField
                          label="Market Rent Units" control={control}
                          name="IIA_RI_MarketRentUnits" error={errors.IIA_RI_MarketRentUnits}
                          isDisabled={disabled}
                        />
                        <PercentField
                          label="Rent Controlled Units" control={control}
                          name="IIA_RI_RentControlledUnits" error={errors.IIA_RI_RentControlledUnits}
                          isDisabled={disabled}
                        />
                        <PercentField
                          label="Affordable Units" control={control}
                          name="IIA_RI_AffordableUnits" error={errors.IIA_RI_AffordableUnits}
                          isDisabled={disabled}
                        />
                        <PercentField
                          label="Section 8 Units" control={control}
                          name="IIA_RI_Section8Units" error={errors.IIA_RI_Section8Units}
                          isDisabled={disabled}
                        />
                        <PercentField
                          label="Other Units" control={control}
                          name="IIA_RI_OtherUnits" error={errors.IIA_RI_OtherUnits}
                          isDisabled={disabled}
                        />
                      </>
                    )}
                  </SimpleGrid>
                </FieldGroup>

                <FieldGroup title="Other Income" flexGrow={1}>
                  <PercentField
                    label="Other Income Inflation" control={control}
                    name="IIA_OtherIncomeInflation" error={errors.IIA_OtherIncomeInflation}
                    isDisabled={disabled}
                  />
                </FieldGroup>
              </HStack>
            </AssumptionsSection>

            <AssumptionsSection title="Renovation Schedule">
              <CheckboxField
                label="Renovated" control={control} name="RS_Renovated" error={errors.RS_Renovated}
                isDisabled={disabled}
              />
            </AssumptionsSection>

            <AssumptionsSection title="Expenses">
              <SimpleGrid columns={2} spacingX={12} spacingY={2}>
                <FlexibleAmountField
                  label="Real Estate Taxes" control={control} register={register} watch={watch}
                  name="EA_RealEstateTaxes" error={errors.EA_RealEstateTaxes} disableType={disabled}
                  restrictOptions={isSyn ? [FlexibleAmountType.total] : null}
                />
                <FlexibleAmountField
                  label="Management Fee" control={control} register={register} watch={watch}
                  name="EA_ManagementFees" error={errors.EA_ManagementFees} disableType={disabled}
                  restrictOptions={isSyn ? [FlexibleAmountType.percentEGI] : null}
                />
              </SimpleGrid>
            </AssumptionsSection>

            <AssumptionsSection title="Expense Inflation">
              <SimpleGrid columns={4} spacingX={12} spacingY={2}>
                <PercentField
                  label="General Inflation" control={control}
                  name="EI_GeneralInflation" error={errors.EI_GeneralInflation}
                  isDisabled={disabled}
                />
                <PercentField
                  label="Real Estate Tax Inflation" control={control}
                  name="EI_RealEstateTaxInflation" error={errors.EI_RealEstateTaxInflation}
                  isDisabled={disabled}
                />
              </SimpleGrid>
            </AssumptionsSection>

            <AssumptionsSection title="Replacement Reserves">
              <VStack>
                <SimpleGrid columns={4} spacingX={12} spacingY={2}>
                  <FlexibleAmountField
                    label="Projected reserves" control={control} register={register} watch={watch}
                    name="RR_ProjectedReserves" error={errors.RR_ProjectedReserves}
                    disableType={disabled}
                    restrictOptions={isSyn ? [FlexibleAmountType.dollarPerUnit] : null}
                  />
                </SimpleGrid>
                <CheckboxField
                  label="Grow At Inflation" control={control}
                  name="RR_GrowAtInflation" error={errors.RR_GrowAtInflation}
                  isDisabled={disabled}
                />
              </VStack>
            </AssumptionsSection>
          </VStack>
        </FlexCol>


      </FlexCol>
    </chakra.form>
  );
}
