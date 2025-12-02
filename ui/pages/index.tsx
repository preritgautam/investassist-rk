import React, { useEffect } from 'react';
import { PageComponent } from '../src/bootstrap/types';
import { FlexCol } from '../src/bootstrap/chakra/components/layouts/FlexCol';
import { HeadingM } from '../src/bootstrap/chakra/components/typography';
import { ClikGatewayLoginButton } from '../src/app/components/app/auth/ClikGatewayLoginButton';
import { userSession } from '../src/userSession';
import { useRoutingService } from '../src/app/services/RoutingService';
import Image from 'next/image';
import INALogo from '../src/app/images/INA_Logo2.svg';
import { getHomeLayout } from '../src/app/components/app/layouts/HomeLayout';
import { Box } from '@chakra-ui/react';

function HomePage() {
  const { token, user } = userSession.useAuthManager();
  const routing = useRoutingService();

  useEffect(() => {
    if (token && user) {
      if (user.roles.includes('SUPER_ADMIN')) {
        routing.gotoAdminDashboard().catch(console.error);
      } else {
        routing.gotoUserHomePage().catch(console.error);
      }
    }
  }, [token, routing, user]);

  return (
    <FlexCol align="center">
      <Box mt={20}>
        <Image src={INALogo} width={400} height={78}/>
      </Box>
      <HeadingM mb={4} mt={20}>If you are a registered user</HeadingM>
      <ClikGatewayLoginButton accountSlug="" variant="solid" colorScheme="secondary">
        Login Via Clik Account
      </ClikGatewayLoginButton>
    </FlexCol>
  );
}

const Home: PageComponent = () => (
  <HomePage/>
);
Home.getLayout = getHomeLayout;

export default Home;

