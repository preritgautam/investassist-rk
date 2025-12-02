import React from 'react';
import { Button, chakra, Divider, FormControl, FormLabel } from '@chakra-ui/react';
import { useApiForm } from '../../../../../bootstrap/hooks/utils/useApiForm';
import { FormErrors } from '../../../../../bootstrap/chakra/components/core/form/FormErrors';
import { EmailField } from '../../../../../bootstrap/chakra/components/core/form/EmailField';
import { FieldErrorMessage } from '../../../../../bootstrap/chakra/components/core/form/FieldErrorMessage';
import { PasswordField } from '../../../../../bootstrap/chakra/components/core/form/PasswordField';

export interface ResetPasswordFormProps {
  onSubmit: (data: object) => any,
  email: string,
}

export function ResetPasswordForm({ email, onSubmit }: ResetPasswordFormProps) {
  const { handleSubmit, register, formErrors, clearFormErrors, formState: { errors } } = useApiForm({
    onSubmit,
  });

  return (
    <chakra.form p={6} onSubmit={handleSubmit}>
      <FormErrors mb={4} errors={formErrors} onClose={clearFormErrors}/>

      <FormControl>
        <FormLabel>Registered Email Address</FormLabel>
        <EmailField value={email} isReadOnly {...register('email')}/>
        <FieldErrorMessage error={errors.email}/>
      </FormControl>

      <FormControl mt={4}>
        <FormLabel>New Password</FormLabel>
        <PasswordField
          placeholder="Enter your new password" autoComplete="new-password"
          {...register('newPassword', {
            required: 'Please provide your new password',
          })}
        />
        <FieldErrorMessage error={errors.newPassword}/>
      </FormControl>

      <Divider my={6} mx={-6} w="auto"/>
      <Button type="submit" w="100%">Reset My Password</Button>
    </chakra.form>
  );
}
