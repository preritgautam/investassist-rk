import React from 'react';
import { chakra, Flex, FormControl, FormLabel, Button } from '@chakra-ui/react';
import { useApiForm } from '../../../../../bootstrap/hooks/utils/useApiForm';
import { Paper, PaperProps } from '../../../../../bootstrap/chakra/components/containers/Paper';
import { HeadingS } from '../../../../../bootstrap/chakra/components/typography';
import { EmailField } from '../../../../../bootstrap/chakra/components/core/form/EmailField';
import { PasswordField } from '../../../../../bootstrap/chakra/components/core/form/PasswordField';
import { LinkButton } from '../../../../../bootstrap/chakra/components/core/LinkButton';
import { FieldErrorMessage } from '../../../../../bootstrap/chakra/components/core/form/FieldErrorMessage';
import { FormErrors } from '../../../../../bootstrap/chakra/components/core/form/FormErrors';
import { LoginCredentials } from '../../../../services/_admin/SuperAdminAuthService';

export interface SuperAdminLoginFormProps extends PaperProps {
  onSubmit: (data: object) => any,
}

export function SuperAdminLoginForm({ onSubmit, ...rest }: SuperAdminLoginFormProps) {
  const { handleSubmit, register, formErrors, formState: { errors }, clearFormErrors } = useApiForm<LoginCredentials>({
    onSubmit,
    defaultValues: {},
  });

  return (
    <Paper w="100%" variant="hoverable" overflow="visible" {...rest}>
      <HeadingS p={3} mx="-1px" mt="-1px" bg="#222" color="#ddd" roundedTop="md">Super Admin Login</HeadingS>

      <chakra.form p={6} onSubmit={handleSubmit}>
        <FormErrors errors={formErrors} onClose={clearFormErrors} mb={4}/>

        <FormControl>
          <FormLabel>Email</FormLabel>
          <EmailField autoComplete="username" {...register('email', {
            required: 'Please provide your email address',
          })}/>
          <FieldErrorMessage error={errors.email}/>
        </FormControl>

        <FormControl mt={4}>
          <FormLabel>Password</FormLabel>
          <PasswordField autoComplete="password" {...register('password', {
            required: 'Please enter your password',
          })}/>
          <FieldErrorMessage error={errors.password}/>
        </FormControl>

        <Flex justify="space-between" align="center" mt={8}>
          <Button colorScheme="primary" type="submit">Login</Button>
          <LinkButton href="/_admin/auth/forgot-password" size="sm">Forgot Password?</LinkButton>
        </Flex>

      </chakra.form>
    </Paper>
  );
}
