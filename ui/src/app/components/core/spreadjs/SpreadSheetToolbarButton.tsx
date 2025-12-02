import React, { ForwardedRef, forwardRef } from 'react';
import { ButtonProps, Tooltip, Button, Icon, As } from '@chakra-ui/react';

export interface SpreadSheetToolbarButtonProps extends ButtonProps {
  title: string,
  action?: any,
  icon: As<any>,
}

export const SpreadSheetToolbarButton = forwardRef(
  function SpreadSheetToolbarButton(
    { title, action, icon, colorScheme, children, ...rest }: SpreadSheetToolbarButtonProps, ref: ForwardedRef<any>,
  ) {
    return (
      <Tooltip label={title} placement="bottom">
        <Button variant="ghost" colorScheme={colorScheme ?? 'secondary'} ref={ref} {...rest}>
          {children}
          <Icon as={icon} fontSize={20}/>
        </Button>
      </Tooltip>
    );
  },
);
