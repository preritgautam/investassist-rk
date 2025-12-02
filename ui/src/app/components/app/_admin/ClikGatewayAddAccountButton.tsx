import React, { useEffect, useState } from 'react';
import { useClikGatewayService } from '../../../services/auth/ClikGatewayService';
import { LinkButton, LinkButtonProps } from '../../../../bootstrap/chakra/components/core/LinkButton';

interface ClikGatewayAddAccountButtonProps extends Omit<LinkButtonProps, 'href'> {
}
const ClikGatewayAddAccountButton = function({ ...rest }: ClikGatewayAddAccountButtonProps) {
  const { addAccountUrl } = useClikGatewayAddAccountUrl();
  return (
    <LinkButton href={addAccountUrl ?? '/'} disabled={!addAccountUrl} {...rest} />
  );
};

export function useClikGatewayAddAccountUrl() {
  const clikGateway = useClikGatewayService();
  const [addAccountUrl, setAddAccountUrl] = useState<string>(null);

  useEffect(() => {
    clikGateway.getAddAccountUrl().then(setAddAccountUrl);
  }, [clikGateway]);

  return { addAccountUrl };
}


export default ClikGatewayAddAccountButton;
