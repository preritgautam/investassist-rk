import React from 'react';
import { useSuperAdminAuthService } from '../../../src/app/services/_admin/SuperAdminAuthService';
import { useBool } from '../../../src/bootstrap/hooks/utils/useBool';
import { BodyM, HeadingS } from '../../../src/bootstrap/chakra/components/typography';
import { Paper } from '../../../src/bootstrap/chakra/components/containers/Paper';
import { ForgotPasswordForm } from '../../../src/app/components/app/forms/auth/ForgotPasswordForm';
import { LinkButton } from '../../../src/bootstrap/chakra/components/core/LinkButton';
import { getDefaultLayout } from '../../../src/app/components/app/layouts/DefaultLayout';
import { Flex } from '@chakra-ui/react';
import { EmailSentIcon } from '../../../src/app/components/app/icons';
import { FlexCol } from '../../../src/bootstrap/chakra/components/layouts/FlexCol';


function ForgotPassword() {
  const authService = useSuperAdminAuthService();
  const [emailSent, markEmailSent] = useBool(false);
  const [inProgress, startProgress, stopProgress] = useBool(false);

  const handleForgotPasswordFormSubmit = React.useCallback(async ({ email }) => {
    startProgress();
    await authService.forgotPassword({ email });
    stopProgress();
    markEmailSent();
  }, [authService, markEmailSent, startProgress, stopProgress]);

  return (
    <Flex direction="column" mt={40}>
      {emailSent && (
        <FlexCol align="center" mt={8} mb={8}>
          <EmailSentIcon color="primary.500" size={64}/>
          <BodyM mt={8}>
            We have sent an email to the provided email address.
          </BodyM>
          <BodyM>
            Please check your inbox and follow the instructions
            in the email.
          </BodyM>
        </FlexCol>
      )}
      {!emailSent && (
        <>
          <Paper w={96} variant="hoverable">
            <HeadingS p={3} mx="-1px" mt="-1px" bg="#222" color="#ddd" roundedTop="md">Forgot Password</HeadingS>
            <ForgotPasswordForm onSubmit={handleForgotPasswordFormSubmit} loading={inProgress}/>
          </Paper>
        </>
      )}

      <Flex mt={8} direction="column" align="center">
        <LinkButton href="/_admin" ml={1} size="sm">
          Go to Login Page
        </LinkButton>
      </Flex>

    </Flex>
  );
}

ForgotPassword.getLayout = getDefaultLayout;

// noinspection JSUnusedGlobalSymbols
export default ForgotPassword;
