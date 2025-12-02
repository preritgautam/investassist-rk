import { LinkButton, LinkButtonProps } from '../../../../bootstrap/chakra/components/core/LinkButton';
import React from 'react';
import { useClikGatewayAdminAuthUrl } from '../../../hooks/auth/useClikGatewayAdminAuthUrl';

interface ClikGatewayAdminLoginButtonProps extends Omit<LinkButtonProps, 'href'> {
}

export function ClikGatewayAdminLoginButton({ ...rest }: ClikGatewayAdminLoginButtonProps) {
  const { authUrl } = useClikGatewayAdminAuthUrl();
  return (
    <LinkButton href={authUrl ?? '/'} disabled={!authUrl} {...rest} />
  );
}
