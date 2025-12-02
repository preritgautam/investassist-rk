import React from 'react';
import { Button, chakra, Divider, FormControl, FormLabel } from '@chakra-ui/react';
import { useApiForm } from '../../../../../bootstrap/hooks/utils/useApiForm';
import { Paper, PaperProps } from '../../../../../bootstrap/chakra/components/containers/Paper';
import { PasswordField } from '../../../../../bootstrap/chakra/components/core/form/PasswordField';
import { FieldErrorMessage } from '../../../../../bootstrap/chakra/components/core/form/FieldErrorMessage';

export interface ChangePasswordFormProps extends PaperProps {
  onSubmit: (data: object, event: Event) => any,
}

export function ChangePasswordForm({ onSubmit, ...rest }: ChangePasswordFormProps) {
  const formRef = React.useRef<HTMLFormElement>();
  const handleFormSubmit = React.useCallback(async (...values) => {
    // @ts-ignore
    await onSubmit(...values);
    formRef.current?.reset();
  }, [onSubmit, formRef]);

  const { register, handleSubmit, formState: { errors } } = useApiForm({
    onSubmit: handleFormSubmit,
  });

  return (
    <Paper variant="hoverable" {...rest}>
      <chakra.form p={8} onSubmit={handleSubmit} ref={formRef}>
        <FormControl>
          <FormLabel>Current Password</FormLabel>
          <PasswordField
            placeholder="Enter your current password"
            {...register('currentPassword', {
              required: 'Please provide your current password',
            })}
          />
          <FieldErrorMessage error={errors?.currentPassword}/>
        </FormControl>

        <FormControl mt={4}>
          <FormLabel>New Password</FormLabel>
          <PasswordField
            placeholder="Enter your new password"
            {...register('newPassword', {
              required: 'Please enter your new password',
            })}
          />
          <FieldErrorMessage error={errors?.newPassword}/>
        </FormControl>

        <Divider mb={4} mt={6} mx={-8}/>

        <div>
          <Button type="submit" w="100%" mb={-4}>Save</Button>
        </div>
      </chakra.form>
    </Paper>
  );
}
