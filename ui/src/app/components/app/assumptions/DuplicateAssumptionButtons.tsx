import { Button, ButtonProps, Icon, IconButton, IconButtonProps } from '@chakra-ui/react';
import React, { ForwardedRef, forwardRef } from 'react';
import { Assumption } from '../../../../types';
import { useDuplicateAssumptionModal } from './DuplicateAssumptionModal';
import { CopyIcon } from '../icons';

export interface DuplicateAssumptionIconButtonProps extends IconButtonProps {
  assumption: Assumption;
}

export const DuplicateAssumptionIconButton = forwardRef(
  ({ assumption, ...rest }: DuplicateAssumptionIconButtonProps, ref: ForwardedRef<any>,
  ) => {
    const [modal, show] = useDuplicateAssumptionModal({ assumption });
    return (
      <>
        <IconButton {...rest} onClick={show} icon={<Icon as={CopyIcon}/>} ref={ref}/>
        {modal}
      </>
    );
  },
);

DuplicateAssumptionIconButton.displayName = 'DuplicateAssumptionIconButton';


export interface DuplicateAssumptionButtonProps extends ButtonProps {
  assumption: Assumption;
}

export const DuplicateAssumptionButton = forwardRef(
  ({ assumption, ...rest }: DuplicateAssumptionButtonProps, ref: ForwardedRef<any>,
  ) => {
    const [modal, show] = useDuplicateAssumptionModal({ assumption });
    return (
      <>
        <Button onClick={show} {...rest} ref={ref}/>
        {modal}
      </>
    );
  },
);

DuplicateAssumptionButton.displayName = 'DuplicateAssumptionButton';
