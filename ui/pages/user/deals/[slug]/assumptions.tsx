import React, { useCallback } from 'react';
import { PageComponent } from '../../../../src/bootstrap/types';
import { getAccountUserLayout } from '../../../../src/app/components/app/layouts/AccountUserLayout2';
import { DealPageLayout } from '../../../../src/app/components/app/deal/used/DealPageLayout';
import { useDealByRouteSlug } from '../../../../src/app/hooks/deal/useDealByRouteSlug';
import { Assumption } from '../../../../src/types';
import { FlexCol } from '../../../../src/bootstrap/chakra/components/layouts/FlexCol';
import { Button, Divider, Flex, Heading, HStack, Text } from '@chakra-ui/react';
import { useCopyFromAssumptionsModal } from '../../../../src/app/components/app/deal/used/CopyFromAssumptionsModal';
import { useDealAssumptionForm } from '../../../../src/app/hooks/deal/useDealAssumptionForm';
import { useIsSampleDeal } from '../../../../src/app/hooks/deal/useIsSampleDeal';
import { useIsFreeAccount } from '../../../../src/app/hooks/deal/useIsFreeAccount';


const DealAssumptionsPage: PageComponent = function() {
  const [deal, isLoading, isError] = useDealByRouteSlug();
  const [assumptionForm, dealAssumption, setAssumptionFormValues, inProgress] = useDealAssumptionForm({
    deal,
    formId: 'edit-assumption',
  });
  const isSampleDeal = useIsSampleDeal(deal);
  const isFreeAccount = useIsFreeAccount();

  const isReadOnlyMode = isSampleDeal || isFreeAccount;

  const resetForm = useCallback(() => {
    setAssumptionFormValues({ ...dealAssumption });
  }, [setAssumptionFormValues, dealAssumption]);

  const updateFormValues = useCallback((values: Assumption) => {
    // eslint-disable-next-line no-unused-vars
    const { name, id, createdAt, updatedAt, ...assumptionFields } = values;
    setAssumptionFormValues(assumptionFields);
  }, [setAssumptionFormValues]);

  const [copyAssumptionModal, showCopyAssumptionModal] = useCopyFromAssumptionsModal({
    onSourceAssumptionSelect: updateFormValues,
  });

  return (
    <DealPageLayout deal={deal} isLoading={isLoading} isError={isError} navId="assumptions">
      <FlexCol flexGrow={1}>
        <Flex p={4} flexGrow={0} flexShrink={0} justify="space-between" align="center">
          <FlexCol>
            <Heading size="md">Deal Assumptions</Heading>
            {isSampleDeal && (
              <Text color="warning.500" fontSize="sm" as="i">*This is a sample deal, you can not save any changes</Text>
            )}
          </FlexCol>
          <HStack>
            <Button onClick={showCopyAssumptionModal} variant="secondary" isDisabled={isReadOnlyMode}>
              Copy From Assumptions Set
            </Button>
            <Divider orientation="vertical" h={8}/>
            <Button size="sm" variant="outline" onClick={resetForm} isDisabled={isReadOnlyMode}>
              Discard Changes
            </Button>
            <Button isLoading={inProgress} size="sm" form="edit-assumption" type="submit"
              isDisabled={isReadOnlyMode}>
              Save Changes
            </Button>
          </HStack>
          {copyAssumptionModal}
        </Flex>
        <FlexCol flexGrow={1} px={4}>
          {assumptionForm}
        </FlexCol>
      </FlexCol>
    </DealPageLayout>
  );
};

DealAssumptionsPage.getLayout = getAccountUserLayout;
export default DealAssumptionsPage;

