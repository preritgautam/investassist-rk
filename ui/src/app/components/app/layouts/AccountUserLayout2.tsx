import React, { useEffect, useState, useCallback } from 'react';
import { useValidateAccountUserSession } from '../../../hooks/auth/useValidateSession';
import { useAccountUserLogout } from '../../../hooks/auth/useLogout';
import { FlexColPage } from '../../../../bootstrap/chakra/components/layouts/Page';
import { GetLayoutFunction } from '../../../../bootstrap/types';
import { Header } from '../../../../bootstrap/chakra/components/layouts/Header';
import logoImage from '../../../images/INALogo.png';
import Image from 'next/image';
import {
  Box,
  Button,
  Center, Heading,
  HStack,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
  Portal,
  Text,
} from '@chakra-ui/react';
import { userSession } from '../../../../userSession';
import { MenuDownIcon } from '../icons';
import { FlexCol } from '../../../../bootstrap/chakra/components/layouts/FlexCol';
import { UserInitials } from '../user/UserInitials';
import { Content } from '../../../../bootstrap/chakra/components/layouts/Content';
import { NavigationSidebar } from '../layout/NavigationSidebar';
import { useMixPanelService } from '../../../services/MixPanelService';
import { useAuthService } from '../../../services/account/user/AuthService';
import { LinkButton } from '../../../../bootstrap/chakra/components/core/LinkButton';
import CheckoutCancel from '../../../images/checkout-cancel.webp';
import { useRoutingService } from '../../../services/RoutingService';
import { DateTime } from 'luxon';
import { renderOnlyOnClient } from '../../../../bootstrap/hoc/renderOnlyOnClient';
import { useInterval } from 'react-use';
import { useTermsAccepted } from '../../../hooks/auth/useTermsAccepted';
import { AccountCoaContextProvider } from '../../../context/AccountCoaContext';
import { AccountCoaSummaryContextProvider } from '../../../context/AccountCoaSummaryContext';

export interface AccountUserLayoutProps {
  children: React.ReactNode,
  ignoreTerms?: boolean
}


function UserMenu() {
  const handleLogout = useAccountUserLogout();
  const { user } = userSession.useAuthManager();
  const [changePasswordUrl, setChangePasswordUrl] = useState('');

  const authService = useAuthService();
  const routing = useRoutingService();

  const getChangePasswordUrl = useCallback(async () => {
    try {
      // User being thrown out may cause this to be rendered before page changes to home page
      // Allowing this to fail silently
      const changePasswordUrl = await authService.getChangePasswordUrl();
      setChangePasswordUrl(changePasswordUrl);
    } catch (e) {}
  }, [authService]);

  useEffect(() => {
    getChangePasswordUrl().then(console.error);
  }, [getChangePasswordUrl]);

  const handleChangePassword = React.useCallback(async () => {
    window.open(changePasswordUrl, '_blank');
  }, [changePasswordUrl]);

  return (
    <Menu>
      <MenuButton
        as={Button} leftIcon={<UserInitials name={user?.name ?? 'User Name'}/>}
        rightIcon={<MenuDownIcon/>} variant="link"
        colorScheme="primaryAlt"
        sx={{
          _hover: {
            textDecoration: 'none',
          },
        }}
      >
        {user?.name}
      </MenuButton>
      <Portal>
        <MenuList zIndex={9}>
          {user.isRootUser && (
            <>
              {/* <MenuItem onClick={routing.gotoPlansPage}>Manage Billing</MenuItem> */}
              <MenuItem onClick={routing.gotoAccountUsersListPage}>Manage Users</MenuItem>
            </>
          )}
          <MenuItem onClick={routing.gotoAccountUserAcceptTermsPage}>Terms & Conditions</MenuItem>
          <MenuItem onClick={handleChangePassword}>
            Settings
          </MenuItem>
          <MenuDivider/>
          <MenuItem onClick={handleLogout}>Logout</MenuItem>
        </MenuList>
      </Portal>
    </Menu>
  );
}

interface RefreshSessionButtonProps {
  timestamp: number;
}

function _RefreshSessionButton({ timestamp }: RefreshSessionButtonProps) {
  const sessionExpiryTime = DateTime.fromMillis(timestamp).plus({ hour: 24 });
  const authService = useAuthService();
  const [durationRemaining, setDurationRemaining] = useState(
    sessionExpiryTime.diff(DateTime.now()).toFormat('hh:mm:ss'),
  );

  useInterval(() => {
    setDurationRemaining(sessionExpiryTime.diff(DateTime.now()).toFormat('hh:mm:ss'));
  }, 1000);

  return (
    <HStack sx={{ zoom: 0.9 }}>
      <Text fontSize="xs">Your session expires in: {durationRemaining}</Text>
      <Button size="xs" variant="ghost" onClick={authService.refreshAccountUserSession}>Refresh Session</Button>
    </HStack>
  );
}

const RefreshSessionButton = renderOnlyOnClient(_RefreshSessionButton);


export function AccountUserLayout({ children, ignoreTerms }: AccountUserLayoutProps) {
  const { user, timestamp } = useValidateAccountUserSession(600);
  useTermsAccepted(ignoreTerms);

  const mixPanelService = useMixPanelService();
  useEffect(() => {
    mixPanelService.identify();
  }, [mixPanelService]);

  if (!user) {
    return <></>;
  }

  return (
    <FlexColPage>
      <Header size={4} justify="space-between" borderBottom="1px" borderColor="border.500">
        <Center>
          <FlexCol p={2} pl={4} alignItems="flex-start">
            <Image key="logo" alt="logo" src={logoImage} width={92} height={18}/>
            <Text fontSize="sm" color="text.500">Powered By Clik.ai</Text>
          </FlexCol>
        </Center>
        <HStack alignItems="center" pr={2}>
          <RefreshSessionButton timestamp={timestamp}/>
          <UserMenu/>
        </HStack>
      </Header>
      <Content flexGrow={1}>
        <NavigationSidebar/>
        <AccountCoaContextProvider accountId={user.accountId}>
          <AccountCoaSummaryContextProvider accountId={user.accountId}>
            {!user.accountDetails.lastInvoiceFailed && children}
            {user.accountDetails.lastInvoiceFailed && (
              <FlexCol alignItems="center" w="full">
                <Heading size="xl" mt={8}>Oops!</Heading>
                <Box w="xl">
                  <Image src={CheckoutCancel}/>
                </Box>
                <Text>It seems the automatic payment of your invoice has failed.</Text>
                <Text>You need to complete the payment to continue using the application.</Text>
                <LinkButton href={user.accountDetails.lastInvoiceUrl} target="_blank" variant="solid" my={4}>
                  Make Payment Now
                </LinkButton>
                <Text>Once you complete the payment, please login again to continue using InvestAssist</Text>
              </FlexCol>
            )}

          </AccountCoaSummaryContextProvider>
        </AccountCoaContextProvider>
      </Content>
    </FlexColPage>
  );
}

export const getAccountUserLayout: GetLayoutFunction = (page) => <AccountUserLayout>{page}</AccountUserLayout>;
