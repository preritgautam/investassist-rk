import React, { useCallback } from 'react';
import { PageComponent } from '../../../../src/bootstrap/types';
import { PageContent } from '../../../../src/bootstrap/chakra/components/layouts/PageContent';
import { Button, HStack } from '@chakra-ui/react';
import { getAccountUserLayout } from '../../../../src/app/components/app/layouts/AccountUserLayout2';
import { AssumptionForm } from '../../../../src/app/components/app/forms/assumption/AssumptionForm';
import { useAssumptionService } from '../../../../src/app/services/account/user/AssumptionService';
import { Assumption } from '../../../../src/types';
import { RoutingService } from '../../../../src/app/services/RoutingService';
import { defaultAssumption } from '../../../../src/app/components/app/forms/assumption/defaultAssumption';

const NewAccountAssumptionPage: PageComponent = () => {
  const assumptionService = useAssumptionService();
  const addAssumption = assumptionService.useAddAccountAssumption();

  const routing: RoutingService = RoutingService.getService();

  const handleSave = useCallback(async (values: Assumption) => {
    await addAssumption.mutateAsync(values);
    await routing.gotoUrl(RoutingService.userAssumptionsPage);
  }, [addAssumption, routing]);

  return (
    <PageContent
      pageTitle="New Assumptions Set"
      mainActionButton={(
        <HStack>
          <Button type="submit" form="new-assumption">Save Assumption</Button>
        </HStack>
      )}
    >
      <AssumptionForm formId="new-assumption" onSave={handleSave} defaultValues={defaultAssumption}/>
    </PageContent>
  );
};

NewAccountAssumptionPage.getLayout = getAccountUserLayout;
export default NewAccountAssumptionPage;
