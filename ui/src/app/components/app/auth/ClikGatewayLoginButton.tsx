import { useClikGatewayAuthUrl } from '../../../hooks/auth/useClikGatewayAuthUrl';
import { LinkButton, LinkButtonProps } from '../../../../bootstrap/chakra/components/core/LinkButton';
import React from 'react';

interface ClikGatewayLoginButtonProps extends Omit<LinkButtonProps, 'href'> {
  accountSlug: string,
}

export function ClikGatewayLoginButton({ accountSlug, ...rest }: ClikGatewayLoginButtonProps) {
  const { authUrl } = useClikGatewayAuthUrl(accountSlug);
  return (
    <LinkButton href={authUrl ?? '/'} disabled={!authUrl} {...rest} />
  );
}
