import React from 'react';
import { useSuperAdminAuthService } from '../../../src/app/services/_admin/SuperAdminAuthService';
import { useBool } from '../../../src/bootstrap/hooks/utils/useBool';
import { decodeBase64 } from '../../../src/bootstrap/utils/base64';
import { useQueryParam } from '../../../src/bootstrap/hooks/utils/useQueryParam';
import { FlexCol } from '../../../src/bootstrap/chakra/components/layouts/FlexCol';
import { Paper } from '../../../src/bootstrap/chakra/components/containers/Paper';
import { BodyM, HeadingS } from '../../../src/bootstrap/chakra/components/typography';
import { ResetPasswordForm } from '../../../src/app/components/app/forms/auth/ResetPasswordForm';
import { LinkButton } from '../../../src/bootstrap/chakra/components/core/LinkButton';
import { ThumbsUpIcon } from '../../../src/app/components/app/icons';
import { getDefaultLayout } from '../../../src/app/components/app/layouts/DefaultLayout';

// noinspection JSUnusedGlobalSymbols
export default function ResetPasswordPage() {
  const authService = useSuperAdminAuthService();
  const [passwordUpdated, setPasswordUpdated] = useBool(false);
  const [inProgress, startProgress, stopProgress] = useBool(false);
  const t = useQueryParam('t');
  const { token, email } = JSON.parse(decodeBase64(t));

  const resetPassword = React.useCallback(async ({ newPassword }) => {
    startProgress();
    await authService.resetPassword({ email, token, newPassword });
    stopProgress();
    setPasswordUpdated();
  }, [authService, email, token, setPasswordUpdated, startProgress, stopProgress]);

  return (
    <FlexCol align="center" pt={8} w="100%">
      {!passwordUpdated && (
        <>
          <Paper mt={8} w={96} variant="hoverable">
            <HeadingS p={3} mx="-1px" mt="-1px" bg="#222" color="#ddd" roundedTop="md">Reset Password</HeadingS>
            <ResetPasswordForm email={email} onSubmit={resetPassword}/>
          </Paper>

          <FlexCol mt={6} align="center">
            <BodyM>
              Remember your password?
              <LinkButton size="sm" href="/_admin" ml={1}>Go to Login Page</LinkButton>
            </BodyM>
          </FlexCol>
        </>
      )}

      {passwordUpdated && (
        <FlexCol mt={8} align="center">
          <ThumbsUpIcon size={56} mb={8} color="primary.500"/>
          <BodyM mb={4}>Your password is successfully updated.</BodyM>
          <LinkButton href="/_admin" isLoading={inProgress}>Continue to Login Page</LinkButton>
        </FlexCol>
      )}
    </FlexCol>
  );
}

ResetPasswordPage.getLayout = getDefaultLayout;
