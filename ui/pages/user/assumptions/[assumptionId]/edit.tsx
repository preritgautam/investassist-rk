import React, { useCallback, useMemo } from 'react';
import { PageComponent } from '../../../../src/bootstrap/types';
import { PageContent } from '../../../../src/bootstrap/chakra/components/layouts/PageContent';
import { useAssumptionService } from '../../../../src/app/services/account/user/AssumptionService';
import { useQueryParam } from '../../../../src/bootstrap/hooks/utils/useQueryParam';
import { Assumption } from '../../../../src/types';
import { Button, Center, Heading, HStack, Spinner, Text, VStack } from '@chakra-ui/react';
import { AssumptionForm } from '../../../../src/app/components/app/forms/assumption/AssumptionForm';
import { useSuccessToast } from '../../../../src/bootstrap/hooks/utils/useSuccessToast';
import { DuplicateAssumptionButton } from '../../../../src/app/components/app/assumptions/DuplicateAssumptionButtons';
import { getAccountUserLayout } from '../../../../src/app/components/app/layouts/AccountUserLayout2';
import { noopObject } from '../../../../src/bootstrap/utils/noop';
import { defaultAssumption } from '../../../../src/app/components/app/forms/assumption/defaultAssumption';

const AssumptionPage: PageComponent = () => {
  const assumptionId = useQueryParam('assumptionId');
  const assumptionService = useAssumptionService();
  const assumptionQuery = assumptionService.useUserAssumption(assumptionId);
  const updateAssumption = assumptionService.useUpdateAssumption();
  const assumption: Assumption = assumptionQuery.data ?? null;
  const toast = useSuccessToast();

  const defaultValues = useMemo(() => ({ ...defaultAssumption, ...(assumption ?? noopObject) }), [assumption]);

  const handleSave = useCallback(async (values: Assumption) => {
    await updateAssumption.mutateAsync(values);
    toast({ description: 'Assumptions saved successfully' });
  }, [updateAssumption, toast]);

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
          {assumption && (
            <DuplicateAssumptionButton colorScheme="secondary" assumption={defaultValues}>
              Duplicate Assumptions
            </DuplicateAssumptionButton>
          )}
          <Button type="submit" form="edit-assumption">Save Assumptions</Button>
        </HStack>
      )}
    >
      <AssumptionForm formId="edit-assumption" onSave={handleSave} defaultValues={defaultValues}/>
    </PageContent>
  );
};

AssumptionPage.getLayout = getAccountUserLayout;
export default AssumptionPage;
