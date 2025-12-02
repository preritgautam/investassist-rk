import { Tooltip } from '../../../../core/Tooltip';
import { Button, ButtonProps, chakra, IconButton } from '@chakra-ui/react';
import { FloorPlanIcon } from '../../../icons';
import React from 'react';

interface FPConfigButtonProps extends ButtonProps {
  isUnsaved: boolean;
  onConfigureFloorPlan: () => void;
  allFPNotMapped: boolean;
}

export function FPConfigButton(
  { isUnsaved, onConfigureFloorPlan, allFPNotMapped, isDisabled, ...rest }: FPConfigButtonProps,
) {
  const colorScheme = (isUnsaved || allFPNotMapped) ? 'warning' : 'success';
  let tooltip = isUnsaved ? 'Please save data before you can configure floor plans.' : '';
  if (allFPNotMapped) {
    tooltip += ' Some floor plans remain to be configured';
  }
  if (!isUnsaved && !allFPNotMapped) {
    tooltip = 'Floorplan Configuration';
  }

  if (tooltip) {
    return (
      <Tooltip label={tooltip}>
        <chakra.span lineHeight={0}>
          <Button
            size="xs"
            aria-label="floor plan configuration" variant="ghost"
            leftIcon={<FloorPlanIcon fontSize={16}/>}
            isDisabled={isUnsaved || isDisabled} colorScheme={colorScheme}
            onClick={onConfigureFloorPlan} {...rest}
          >Floor Plan</Button>
        </chakra.span>
      </Tooltip>
    );
  } else {
    return (
      <IconButton
        aria-label="floor plan configuration" variant="ghost"
        icon={<FloorPlanIcon fontSize={16}/>}
        isDisabled={isUnsaved || isDisabled} colorScheme={colorScheme}
        onClick={onConfigureFloorPlan} {...rest}
      />
    );
  }
}
