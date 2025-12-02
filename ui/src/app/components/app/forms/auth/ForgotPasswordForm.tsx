import React from 'react';
import { Button, chakra, Divider, FormControl, FormLabel } from '@chakra-ui/react';
import { useApiForm } from '../../../../../bootstrap/hooks/utils/useApiForm';
import { FormErrors } from '../../../../../bootstrap/chakra/components/core/form/FormErrors';
import { EmailField } from '../../../../../bootstrap/chakra/components/core/form/EmailField';
import { FieldErrorMessage } from '../../../../../bootstrap/chakra/components/core/form/FieldErrorMessage';
import { FlexCol } from '../../../../../bootstrap/chakra/components/layouts/FlexCol';

export interface ChangePasswordFormProps {
  onSubmit: (data: object) => any,
  loading: boolean,
}

export function ForgotPasswordForm({ onSubmit, loading }: ChangePasswordFormProps) {
  const { handleSubmit, register, formErrors, clearFormErrors, formState: { errors } } = useApiForm({
    onSubmit,
  });

  return (
    <chakra.form p={6} px={8} onSubmit={handleSubmit}>
      <FormErrors errors={formErrors} onClose={clearFormErrors}/>

      <FormControl>
        <FormLabel>Registered Email Address</FormLabel>
        <EmailField autoComplete="username" {...register('email', {
          required: 'Please provide your email address',
        })}/>
        <FieldErrorMessage error={errors.email}/>
      </FormControl>

      <Divider my={6} ml={-6} mr={-6} w="auto"/>

      <FlexCol align="stretch">
        <Button type="submit" isLoading={loading}>Send Reset Password Link</Button>
      </FlexCol>

    </chakra.form>
  );
}
