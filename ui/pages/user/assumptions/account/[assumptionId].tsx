import React from 'react';
import { PageComponent } from '../../../../src/bootstrap/types';
import { PageContent } from '../../../../src/bootstrap/chakra/components/layouts/PageContent';
import { getAccountUserLayout } from '../../../../src/app/components/app/layouts/AccountUserLayout2';
import { useAssumptionService } from '../../../../src/app/services/account/user/AssumptionService';
import { useQueryParam } from '../../../../src/bootstrap/hooks/utils/useQueryParam';
import { Assumption } from '../../../../src/types';
import { Center, Heading, HStack, Spinner, Text, VStack } from '@chakra-ui/react';
import { AssumptionForm } from '../../../../src/app/components/app/forms/assumption/AssumptionForm';
import {
  DuplicateAssumptionButton,
} from '../../../../src/app/components/app/assumptions/DuplicateAssumptionButtons';

const ViewAssumptionPage: PageComponent = () => {
  const assumptionId = useQueryParam('assumptionId');
  const assumptionService = useAssumptionService();
  const assumptionQuery = assumptionService.useAccountAssumption(assumptionId);
  const assumption: Assumption = assumptionQuery.data ?? null;

  if (assumptionQuery.isLoading) {
    return (
      <Center flexGrow={1}>
        <Spinner size="xl"/>
      </Center>
    );
  }

  if (assumptionQuery.isError) {
    return (
      <Center h="100%">
        <VStack>
          <Heading size="md" color="danger.500">Oops! There was an error</Heading>
          <Text mt={8} fontSize="md">Please try again later in some time</Text>
        </VStack>
      </Center>
    );
  }

  return (
    <PageContent
      pageTitle={`Assumption - ${assumption.name}`}
      mainActionButton={(
        <HStack>
          <DuplicateAssumptionButton assumption={assumption}>Duplicate</DuplicateAssumptionButton>
        </HStack>
      )}
    >
      <AssumptionForm formId="edit-assumption" onSave={() => null} defaultValues={assumption} disabled={true}/>
    </PageContent>
  );
};

ViewAssumptionPage.getLayout = getAccountUserLayout;
export default ViewAssumptionPage;
