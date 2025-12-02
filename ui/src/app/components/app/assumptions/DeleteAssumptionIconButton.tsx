import { Icon, IconButton, IconButtonProps } from '@chakra-ui/react';
import { Assumption } from '../../../../types';
import React, { ForwardedRef, forwardRef, FunctionComponent } from 'react';
import { ConfirmPopup } from '../../../../bootstrap/chakra/components/popups/ConfirmPopup';
import { useDeleteAssumption } from '../../../hooks/assumption/useDeleteAssumption';
import { DeleteIcon } from '../icons';

interface DeleteAssumptionIconButtonProps extends IconButtonProps {
  assumption: Assumption,
}

export const DeleteAssumptionIconButton: FunctionComponent<DeleteAssumptionIconButtonProps> =
  forwardRef(({ assumption, ...rest }: DeleteAssumptionIconButtonProps, ref: ForwardedRef<any>) => {
    const handleDelete = useDeleteAssumption({ assumption });
    return (
      <ConfirmPopup
        title="Delete Assumption?"
        message={`Are you sure you want to delete assumption - ${assumption.name}?`}
        onConfirm={handleDelete}
        colorScheme="danger"
      >
        <IconButton ref={ref} icon={<Icon as={DeleteIcon}/>} {...rest} />
      </ConfirmPopup>
    );
  });
DeleteAssumptionIconButton.displayName = 'DeleteAssumptionIconButton';

