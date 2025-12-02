import React from 'react';
import { useAccountService } from '../../../../services/account/user/AccountService';
import { LinkButton } from '../../../../../bootstrap/chakra/components/core/LinkButton';

export function StripePortalLinkButton() {
  const accountService = useAccountService();
  const query = accountService.useStripePortalUrlQuery();

  return (
    <LinkButton
      href={query.data || ''} isDisabled={!query.data}
      variant="solid" target="_blank"
    >
      Manage Billing Details
    </LinkButton>
  );
}
