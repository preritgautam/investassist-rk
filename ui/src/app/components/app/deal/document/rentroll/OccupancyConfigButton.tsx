import { Button, ButtonProps, IconButton } from '@chakra-ui/react';
import { Tooltip } from '../../../../core/Tooltip';
import { OccupancyIcon } from '../../../icons';
import React from 'react';

interface OccupancyConfigButtonProps extends ButtonProps {
  isUnsaved: boolean;
  onConfigureOccupancy: () => void;
  allOccupancyNotMapped: boolean;
}

export function OccupancyConfigButton(
  { isUnsaved, onConfigureOccupancy, allOccupancyNotMapped, isDisabled, ...rest }: OccupancyConfigButtonProps,
) {
  const colorScheme = (isUnsaved || allOccupancyNotMapped) ? 'warning' : 'success';
  let tooltip = isUnsaved ? 'Please save data before you can configure occupancy codes.' : '';
  if (allOccupancyNotMapped) {
    tooltip += ' Some occupancy codes remain to be configured';
  }
  if (!isUnsaved && !allOccupancyNotMapped) {
    tooltip = 'Occupancy Configuration';
  }

  if (tooltip) {
    return (
      <Tooltip label={tooltip} shouldWrapChildren>
        <Button
          size="xs"
          aria-label="occupancy configuration" variant="ghost"
          leftIcon={<OccupancyIcon fontSize={16}/>}
          isDisabled={isUnsaved || isDisabled} colorScheme={colorScheme}
          onClick={onConfigureOccupancy} {...rest}
        >Occupancy</Button>
      </Tooltip>
    );
  } else {
    return (
      <IconButton
        aria-label="occupancy configuration" variant="ghost"
        icon={<OccupancyIcon fontSize={16}/>}
        isDisabled={isUnsaved || isDisabled} colorScheme={colorScheme}
        onClick={onConfigureOccupancy} {...rest}
      />
    );
  }
}
