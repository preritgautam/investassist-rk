import { ButtonProps, IconButton } from '@chakra-ui/react';
import { AccountUser } from '../../../../types';
import { userSession } from '../../../../userSession';
import { useAdminAccountUserService } from '../../../services/account/admin/AccountUserService';
import { useSimpleToast } from '../../../hooks/utils/useSimpleToast';
import React, { useCallback } from 'react';
import { ConfirmPopup } from '../../../../bootstrap/chakra/components/popups/ConfirmPopup';
import { DeleteIcon } from '../icons';
import { useSAAccountUserService } from '../../../services/_admin/AccountUserService';


interface DeleteAccountUserButtonProps extends ButtonProps {
    accountUser: AccountUser,
    onSuccess: () => void,
    accountId?: string,
}

export function DeleteAccountUserButton({ accountUser, accountId, onSuccess, ...rest }: DeleteAccountUserButtonProps) {
  const { user: currentUser } = userSession.useAuthManager();
  const deleteUser = useAdminAccountUserService().useDeleteUser();
  const toast = useSimpleToast();

  const superAdminDeleteUser = useSAAccountUserService().useDeleteUser();

  const handleDeleteUser = useCallback(async () => {
    const displayToast = () => toast({
      title: 'Success!',
      status: 'success',
      duration: 3000,
      isClosable: true,
      description: `User '${accountUser.name}' was successfully deleted.`,
    });
    if (accountId) {
      await superAdminDeleteUser.mutateAsync({ accountId, userId: accountUser.id });
      displayToast();
    } else {
      await deleteUser.mutateAsync(accountUser.id);
      displayToast();
    }
  }, [accountUser, toast, deleteUser, accountId, superAdminDeleteUser]);
  return (

    <ConfirmPopup
      title="Delete User?"
      message={`Are you sure you want to delete user - ${accountUser.name}?`}
      onConfirm={handleDeleteUser}
      colorScheme="danger"
    >
      <IconButton
        aria-label='delete user'
        colorScheme='danger'
        size='xs'
        variant='outline'
        icon={<DeleteIcon />}
        disabled={accountUser.isRootUser || accountUser.id === currentUser?.id}
        {...rest}
      />
    </ConfirmPopup>
  );
}
