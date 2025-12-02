import React, { useMemo } from 'react';
import { PageComponent } from '../../../src/bootstrap/types';
import { getAccountUserLayout } from '../../../src/app/components/app/layouts/AccountUserLayout2';
import { useQueryParam } from '../../../src/bootstrap/hooks/utils/useQueryParam';
import { PageContent } from '../../../src/bootstrap/chakra/components/layouts/PageContent';
import { useDealService } from '../../../src/app/services/account/user/DealService';
import { Tab, TabList, TabPanels, Tabs } from '@chakra-ui/react';
import { TabPanel2 } from '../../../src/app/components/core/chakra/TabPanel2';
import { Deal } from '../../../src/types';
import { LinkButton } from '../../../src/bootstrap/chakra/components/core/LinkButton';
import { RoutingService } from '../../../src/app/services/RoutingService';
import { CashflowComps } from '../../../src/app/components/app/comps/CashflowComps';
import { RentrollComps } from '../../../src/app/components/app/comps/RentrollComps';

const CompareDealsPage: PageComponent = () => {
  const dealSlugs: string[] = useQueryParam('deals').split(',');
  const dealsQueryList = useDealService().useMultipleDeals(dealSlugs);
  const dealsData = useMemo(() => dealsQueryList.map((dq) => dq.data), [dealsQueryList]);

  if (dealsData.some((d: Deal) => !d)) {
    return (
      <PageContent pageTitle="Property Comps" noDivider>
        Loading..
      </PageContent>
    );
  }

  return (
    <PageContent
      pageTitle="Property Comps" noDivider
      mainActionButton={(
        <LinkButton variant="solid" flexShrink={0} href={`${RoutingService.userCompsPage}?deals=${dealSlugs}`}>
          Reselect Properties
        </LinkButton>
      )}
    >
      <Tabs flexGrow={1} mt={2} variant="enclosed">
        <TabList>
          <Tab>Cash Flow</Tab>
          <Tab>Rent Roll</Tab>
        </TabList>
        <TabPanels h="full">
          <TabPanel2 h="full">
            <CashflowComps deals={dealsData}/>
          </TabPanel2>
          <TabPanel2 h="full">
            <RentrollComps deals={dealsData}/>
          </TabPanel2>
        </TabPanels>
      </Tabs>
    </PageContent>
  );
};

CompareDealsPage.getLayout = getAccountUserLayout;

export default CompareDealsPage;
