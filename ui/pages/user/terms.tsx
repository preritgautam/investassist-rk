import React, { useCallback, useState } from 'react';
import { PageComponent } from '../../src/bootstrap/types';
import { AccountUserLayout } from '../../src/app/components/app/layouts/AccountUserLayout2';
import { FlexCol } from '../../src/bootstrap/chakra/components/layouts/FlexCol';
import { userSession } from '../../src/userSession';
import { AccountUser } from '../../src/types';
import { Checkbox, Link, Text } from '@chakra-ui/react';
import { PageContent } from '../../src/bootstrap/chakra/components/layouts/PageContent';
import { Content } from '../../src/bootstrap/chakra/components/layouts/Content';
import { useAuthService } from '../../src/app/services/account/user/AuthService';
import { DateTime } from 'luxon';
import { RoutingService } from '../../src/app/services/RoutingService';


const TermsPage: PageComponent = () => {
  const { user }: { user: AccountUser } = userSession.useAuthManager();
  const authService = useAuthService();
  const [working, setWorking] = useState(false);
  const dealsPage = RoutingService.userDealsPage;

  const handleAccept = useCallback(async () => {
    setWorking(true);
    await authService.acceptTerms();
    setWorking(false);
  }, [authService]);

  return (
    <PageContent pageTitle="Terms and Conditions" noDivider>
      <Content justifyContent="center">


        {user.acceptedTermsOn && (
          <FlexCol w="xl" mt={16} p={4} border="1px" gap={2}>
            <Text>
              We have your acceptance to our&nbsp;
              <Link
                href="https://www.clik.ai/terms-and-conditions" target="_blank" rel="noreferrer"
                color="primary.500"
              >
                Terms and the Privacy Policy
              </Link>.
              &nbsp;You accepted to these terms on {DateTime.fromISO(user.acceptedTermsOn).toLocaleString()}.
            </Text>
            <Text>
              You can continue using the InvestAssist service.
            </Text>
            <Text>
              <Link href={dealsPage}>Click here to go to the Deals Page</Link>
            </Text>
          </FlexCol>
        )}
        {!user.acceptedTermsOn && (
          <FlexCol>
            <FlexCol w="xl" mt={16} p={4} border="1px" gap={2}>
              <Text>
                Before you can proceed any further you need to accept our latest&nbsp;
                <Link
                  href="https://www.clik.ai/terms-and-conditions" target="_blank" rel="noreferrer"
                  color="primary.500"
                >
                  Terms and Privacy Policy
                </Link>
                &nbsp;to continue using this service.
              </Text>
              <Text>
                Please review the policy document and check the following checkbox to continue using this service
              </Text>

              <Checkbox mt={4} onChange={handleAccept} isDisabled={working}>
                I accept&nbsp;
                <Link
                  href="https://www.clik.ai/terms-and-conditions" target="_blank" rel="noreferrer" color="primary.500"
                >
                  Terms and the Privacy Policy
                </Link>
                &nbsp;to use this service
              </Checkbox>

            </FlexCol>
          </FlexCol>
        )}

      </Content>
    </PageContent>
  );
};

TermsPage.getLayout = (page) => <AccountUserLayout ignoreTerms>{page}</AccountUserLayout>;

export default TermsPage;
