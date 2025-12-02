import { Sidebar } from '../../../../bootstrap/chakra/components/layouts/sidebar/Sidebar';
import { NavigationButton } from './NavigationButton';
import { RoutingService } from '../../../services/RoutingService';
import { AssumptionsIcon, CompsIcon, DealsIcon } from '../icons';
import React from 'react';
import { useRouter } from 'next/router';

export function NavigationSidebar() {
  const router = useRouter();
  const { pathname } = router;

  const isDashboard = pathname === RoutingService.userDashboardPage;
  const isDealsPage = !isDashboard && pathname.startsWith(RoutingService.userDealsPage);
  const isAssumptionsPage = !isDashboard && pathname.startsWith(RoutingService.userAssumptionsPage);
  const isCompsPage = !isDashboard && pathname.startsWith(RoutingService.userCompsPage);

  return (
    <Sidebar h="100%" variant="shadowRight" display="flex" flexDir="column" alignItems="stretch" w={28}>
      <NavigationButton
        label="Deals" href={RoutingService.userDealsPage} icon={DealsIcon}
        variant={isDealsPage ? 'active' : 'inactive'} colorScheme={isDealsPage ? 'primary' : 'primaryAlt'}
      />
      <NavigationButton
        label="Assumptions" href={RoutingService.userAssumptionsPage} icon={AssumptionsIcon}
        variant={isAssumptionsPage ? 'active' : 'inactive'} colorScheme={isAssumptionsPage ? 'primary' : 'primaryAlt'}
      />
      <NavigationButton
        label="Comps" href={RoutingService.userCompsPage} icon={CompsIcon}
        variant={isCompsPage ? 'active' : 'inactive'} colorScheme={isCompsPage ? 'primary' : 'primaryAlt'}
      />
    </Sidebar>
  );
}
