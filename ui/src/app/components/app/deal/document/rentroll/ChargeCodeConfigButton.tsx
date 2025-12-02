import { Tooltip } from '../../../../core/Tooltip';
import { Button, chakra, IconButtonProps } from '@chakra-ui/react';
import { ChargeCodeIcon } from '../../../icons';
import React from 'react';

interface ChargeCodeConfigButtonProps extends Omit<IconButtonProps, 'aria-label'> {
  isUnsaved: boolean;
  onConfigureChargeCodes: () => void;
  allChargeCodesNotMapped: boolean;
}

export function ChargeCodeConfigButton(
  { isUnsaved, onConfigureChargeCodes, allChargeCodesNotMapped, isDisabled, ...rest }: ChargeCodeConfigButtonProps,
) {
  const colorScheme = (isUnsaved || allChargeCodesNotMapped) ? 'warning' : 'success';
  let tooltip = isUnsaved ? 'Please save data before you can configure charge codes.' : '';
  if (allChargeCodesNotMapped) {
    tooltip += ' Some charge codes remain to be configured';
  }
  if (!isUnsaved && !allChargeCodesNotMapped) {
    tooltip = 'Charge Codes Configuration';
  }

  if (tooltip) {
    return (
      <Tooltip label={tooltip}>
        <chakra.span lineHeight={0}>
          <Button
            size="xs"
            aria-label="charge code configuration" variant="ghost"
            leftIcon={<ChargeCodeIcon fontSize={16}/>}
            isDisabled={isUnsaved || isDisabled} colorScheme={colorScheme}
            onClick={onConfigureChargeCodes} {...rest}
          >Charge Codes</Button>
        </chakra.span>
      </Tooltip>
    );
  } else {
    return (
      <Button
        aria-label="charge code configuration" variant="ghost"
        leftIcon={<ChargeCodeIcon fontSize={16}/>}
        isDisabled={isUnsaved || isDisabled} colorScheme={colorScheme}
        onClick={onConfigureChargeCodes} {...rest}
      >Charge Codes</Button>
    );
  }
}
