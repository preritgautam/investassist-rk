import React, { useCallback } from 'react';
import { PageComponent } from '../../../src/bootstrap/types';
import { PageContent } from '../../../src/bootstrap/chakra/components/layouts/PageContent';
import { DealsTable } from '../../../src/app/components/app/deal/used/DealsTable';
import { useToggle } from '../../../src/bootstrap/hooks/utils/useToggle';
import { Box, Button, Center, CircularProgress, HStack, Icon } from '@chakra-ui/react';
import { FilterIcon, GridViewIcon, TableViewIcon } from '../../../src/app/components/app/icons';
import { DealsGridView } from '../../../src/app/components/app/deals/DealsGridView';
import { getAccountUserLayout } from '../../../src/app/components/app/layouts/AccountUserLayout2';
import { useDealsFilterForm } from '../../../src/app/components/app/deals/DealsFilterForm';
import { AddDealButton } from '../../../src/app/components/app/deals/AddDealButton';
import { useFilteredDeals } from '../../../src/app/hooks/deals/useFilteredDeals';
import { useAccountService } from '../../../src/app/services/account/user/AccountService';
import { noopArray } from '../../../src/bootstrap/utils/noop';
import { userSession } from '../../../src/userSession';
import { NoDealsView } from '../../../src/app/components/app/deal/used/NoDealsView';
import { NoFilteredDealsView } from '../../../src/app/components/app/deal/used/NoFilteredDealsView';

const DealsPage: PageComponent = () => {
  const { user } = userSession.useAuthManager();

  const isTableView = user?.userPreferences?.dealsView === 'table';

  const [showTableView, toggleView] = useToggle(isTableView);
  const [filterForm, dealsFilers, toggleFilterForm, clearFilters] = useDealsFilterForm();
  const { deals, unFilteredDealsPresent, isLoading } = useFilteredDeals(dealsFilers);
  const users = useAccountService().useQueries().useAccountUsers().data ?? noopArray;

  const updateUserPreferences = useAccountService().useUpdateUserPreferences();

  const handleClick = useCallback(async () => {
    toggleView();
    await updateUserPreferences.mutateAsync({ userPreferences: { dealsView: showTableView ? 'grid' : 'table' } });
  }, [showTableView, toggleView, updateUserPreferences]);


  return (
    <PageContent
      pageTitle="All Deals"
      noDivider
      flexGrow={1}
      mainActionButton={(
        <HStack>
          <AddDealButton size="sm">+ Add Deal</AddDealButton>
          <Button variant="secondary" onClick={toggleFilterForm}>
            <Icon as={FilterIcon} fontSize={16}/>
          </Button>
          <Button variant="secondary" onClick={handleClick}>
            <Icon as={showTableView ? GridViewIcon : TableViewIcon} fontSize="lg"/>
          </Button>
        </HStack>
      )}
    >
      <Box my={4}>
        {filterForm}
      </Box>
      {isLoading && (
        <Center h="full">
          <CircularProgress isIndeterminate={true}/>
        </Center>
      )}
      {!isLoading && !unFilteredDealsPresent && <NoDealsView/>}
      {!isLoading && deals?.length === 0 && unFilteredDealsPresent && (
        <NoFilteredDealsView clearFilters={clearFilters}/>
      )}

      {unFilteredDealsPresent && deals?.length > 0 && showTableView && (
        <DealsTable deals={deals} accountUsers={users}/>
      )}

      {unFilteredDealsPresent && deals?.length > 0 && !showTableView && (
        <DealsGridView deals={deals} accountUsers={users}/>
      )}
    </PageContent>
  );
};

DealsPage.getLayout = getAccountUserLayout;
export default DealsPage;
