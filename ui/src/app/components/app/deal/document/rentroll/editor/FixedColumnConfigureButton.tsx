import { RentRollFixedField } from '../../../../../../enums/RentRollFieldEnum';
import { UseRenovatedUnitsModalButton } from '../RenovatedUnitsModal';
import { UseAffordableUnitsModalButton } from '../AffordableUnitsModal';
import React from 'react';
import { ChargeCodeConfig, DealDocument, FPConfig, RRFDataColumn, RRFExtractedData } from '../../../../../../../types';
import { ButtonProps } from '@chakra-ui/react';
import { UseMtmUnitsModalButton } from '../MTMUnitsModal';

interface FixedColumnConfigureButtonProps extends ButtonProps {
  dealId: string;
  document: DealDocument;
  column: RRFDataColumn,
  data?: RRFExtractedData;
  floorPlanConfig?: FPConfig;
  chargeCodeConfig?: ChargeCodeConfig;
  onValuesUpdate: (column: RRFDataColumn, values: any[]) => void;
}

export function FixedColumnConfigureButton(
  {
    dealId,
    document,
    column,
    data,
    floorPlanConfig,
    chargeCodeConfig,
    onValuesUpdate,
    ...buttonProps
  }: FixedColumnConfigureButtonProps,
) {
  if (column.type === 'fixed' && column.name === RentRollFixedField.MTM.key) {
    return (
      <UseMtmUnitsModalButton
        dealId={dealId} document={document} data={data} chargeCodeConfig={chargeCodeConfig}
        onMtmStatusUpdate={(values) => onValuesUpdate(column, values)}
      />
    );
  }

  if (column.type === 'fixed' && column.name === RentRollFixedField.Renovated.key) {
    return (
      <UseRenovatedUnitsModalButton
        dealId={dealId} documentId={document?.id}
        onRenovationStatusUpdate={(values) => onValuesUpdate(column, values)}
        data={data} floorPlanConfig={floorPlanConfig} chargeCodeConfig={chargeCodeConfig}
        {...buttonProps}
      />
    );
  }
  if (column.type === 'fixed' && column.name === RentRollFixedField.Affordable.key) {
    return (
      <UseAffordableUnitsModalButton
        dealId={dealId} documentId={document?.id}
        onAffordableStatusUpdate={(values) => onValuesUpdate(column, values)}
        data={data} floorPlanConfig={floorPlanConfig} chargeCodeConfig={chargeCodeConfig}
        {...buttonProps}
      />
    );
  }
  return null;
}
