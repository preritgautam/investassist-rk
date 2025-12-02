import { useToast } from '@chakra-ui/react';
import React from 'react';
import { useSuperAdminAuthService } from '../../../src/app/services/_admin/SuperAdminAuthService';
import { PageContent } from '../../../src/bootstrap/chakra/components/layouts/PageContent';
import { getAdminLayout } from '../../../src/app/components/app/layouts/SuperAdminLayout';
import { ChangePasswordForm } from '../../../src/app/components/app/forms/auth/ChangePasswordForm';

function ChangePasswordPage() {
  const authService = useSuperAdminAuthService();
  const toast = useToast();

  const handleChangePassword = React.useCallback(async ({ currentPassword, newPassword }) => {
    await authService.updatePassword({ currentPassword, newPassword });
    toast({
      title: 'Password Updated',
      description: 'Your password is successfully updated.',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  }, [authService, toast]);

  return (
    <PageContent pageTitle="Change Password">
      <ChangePasswordForm w={96} onSubmit={handleChangePassword} alignSelf="center"/>
    </PageContent>
  );
}

ChangePasswordPage.getLayout = getAdminLayout;

// noinspection JSUnusedGlobalSymbols
export default ChangePasswordPage;
