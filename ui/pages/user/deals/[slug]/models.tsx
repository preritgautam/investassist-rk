import React, { useCallback, useEffect, useState } from 'react';
import { PageComponent } from '../../../../src/bootstrap/types';
import { getAccountUserLayout } from '../../../../src/app/components/app/layouts/AccountUserLayout2';
import { DealPageLayout } from '../../../../src/app/components/app/deal/used/DealPageLayout';
import { useDealByRouteSlug } from '../../../../src/app/hooks/deal/useDealByRouteSlug';
import { useDealDocuments } from '../../../../src/app/hooks/deal/useDealDocuments';
import { FlexCol } from '../../../../src/bootstrap/chakra/components/layouts/FlexCol';
import {
  Button,
  Checkbox,
  Divider,
  Flex,
  Heading,
  HStack, Icon,
  Text,
} from '@chakra-ui/react';
import { ModelDocumentsTable } from '../../../../src/app/components/app/deal/documents/ModelDocumentsTable';
import { ModelNoDocumentsState } from '../../../../src/app/components/app/deal/documents/ModelNoDocumentsState';
import { DealDocument } from '../../../../src/types';
import { useIsVisible } from '../../../../src/bootstrap/hooks/utils/useIsVisible';
import { downloadDealModelApi } from '../../../../src/app/api/accountUser';
import { saveAs } from 'file-saver';
import { DateTime } from 'luxon';
import { useDealService } from '../../../../src/app/services/account/user/DealService';
import { DealModelHistory } from '../../../../src/app/components/app/deal/used/DealModelHistory';
import { useBool } from '../../../../src/bootstrap/hooks/utils/useBool';
import { useSimpleToast } from '../../../../src/app/hooks/utils/useSimpleToast';
import { InfoIcon2 } from '../../../../src/app/components/app/icons';
import { useIsSampleDeal } from '../../../../src/app/hooks/deal/useIsSampleDeal';
import { useIsFreeAccount } from '../../../../src/app/hooks/deal/useIsFreeAccount';
import { useMixPanelService } from '../../../../src/app/services/MixPanelService';


const ModelsPage: PageComponent = () => {
  const [deal, isLoading, isError] = useDealByRouteSlug();
  const { documents, cfDocuments, rrDocuments } = useDealDocuments(deal, {
    refetchInterval: 30000,
  });
  const [selectedDocuments, setSelectedDocuments] = useState<DealDocument[]>([]);
  const [showModelHistory, , , , toggleModelHistory] = useIsVisible(false);
  const hasDocuments = documents.length > 0;
  const isSampleDeal = useIsSampleDeal(deal);

  const isFreeAccount = useIsFreeAccount();

  const [addModelToHistory, setAddModelToHistory] = useState(false);

  const dealService = useDealService();
  const dealModelHistoryQuery = dealService.useDealModelHistory(deal?.id);

  const [inProgress, startProgress, stopProgress] = useBool(false);

  const handleChange = useCallback((e) => {
    setAddModelToHistory(e.target.checked);
  }, []);

  const toast = useSimpleToast();
  const mixPanelService = useMixPanelService();

  useEffect(() => {
    if (isSampleDeal) {
      const validatedDocuments = documents.filter((d: DealDocument) => d.status === 'Validated');
      setSelectedDocuments(validatedDocuments);
    }
  }, [isSampleDeal, documents]);

  const generateModel = useCallback(async () => {
    const rentRollIds = selectedDocuments
      .filter((d) => d.documentType === 'RRF')
      .map((d) => d.id);

    const cashFlowIds = selectedDocuments
      .filter((d) => d.documentType === 'CF')
      .map((d) => d.id);

    startProgress();
    try {
      const response = await downloadDealModelApi({
        urlParams: deal?.id,
        data: {
          rentRollIds, cashFlowIds, addToModelHistory: addModelToHistory,
        },
      });
      saveAs(response.data, `${deal?.name} - output - ${DateTime.now().toISO({ includeOffset: false })}.xlsm`);
      mixPanelService.trackDealModelGeneratedEvent(deal, rentRollIds, cashFlowIds);
    } catch (e) {
      toast({
        description: 'Model download failed due to some unexpected error',
        title: 'Fail!',
        status: 'error',
      });
    }
    stopProgress();
  }, [selectedDocuments, deal, addModelToHistory, startProgress, stopProgress, toast, mixPanelService]);

  return (
    <DealPageLayout deal={deal} isLoading={isLoading} isError={isError} navId="models">
      <FlexCol flexGrow={1}>
        {hasDocuments && (
          <>
            <FlexCol flexGrow={0} flexShrink={0}>
              <Flex bg="primary.50" border="1px solid" borderColor="primary.500" m={4} mb={0}>
                <HStack>
                  <Icon as={InfoIcon2} m={2} mr={-2} color="primary.500"/>
                  <Text p={2} fontSize="sm">
                    Please review & validate the documents which you want to use for generating the model
                  </Text>
                </HStack>
              </Flex>
              {isSampleDeal && (
                <Text fontSize="sm" color="warning.500" as="i" m={4} mb={0}>
                  *This is a sample deal, you can only download model with pre-selected documents
                </Text>
              )}
            </FlexCol>
            <Flex px={4} py={4} flexGrow={0} flexShrink={0} align="center" justify="space-between">
              <Heading size="md">Generate Model</Heading>
              <Button
                variant="secondary" isActive={showModelHistory} onClick={toggleModelHistory}
                isDisabled={isFreeAccount}
              >
                Model History
              </Button>
            </Flex>
          </>
        )}
        <Flex flexGrow={1} minH={0} overflow="auto">
          <FlexCol flexGrow={1}>
            <FlexCol flexGrow={1}>
              {!hasDocuments && (
                <ModelNoDocumentsState deal={deal}/>
              )}
              {hasDocuments && (
                <ModelDocumentsTable
                  cfDocuments={cfDocuments} rrDocuments={rrDocuments} deal={deal}
                  onDocumentSelectionChange={setSelectedDocuments} selectedDocuments={selectedDocuments}
                  isSampleDeal={isSampleDeal}
                />
              )}
            </FlexCol>
            {hasDocuments && (
              <Flex
                flexShrink={0} justify="space-between" py={4} px={4} gap={2} borderTop="1px" borderColor="border.500"
                align="center"
              >
                <Text>{selectedDocuments.length} Document(s) Selected</Text>
                <HStack spacing={4}>
                  <Checkbox
                    isChecked={addModelToHistory} onChange={handleChange}
                    isDisabled={selectedDocuments.length === 0 || isSampleDeal || isFreeAccount}
                  >
                    Add To History
                  </Checkbox>
                  <Divider orientation="vertical" h={8}/>
                  <Button
                    isDisabled={selectedDocuments.length === 0 || isFreeAccount}
                    onClick={generateModel} isLoading={inProgress}
                  >Generate Model</Button>
                </HStack>
              </Flex>
            )}
          </FlexCol>
          {showModelHistory && (
            <DealModelHistory
              hasDocuments={hasDocuments} deal={deal}
              modelHistories={dealModelHistoryQuery.data} isLoading={dealModelHistoryQuery.isLoading}
            />
          )}
        </Flex>
      </FlexCol>
    </DealPageLayout>
  );
};

ModelsPage.getLayout = getAccountUserLayout;
export default ModelsPage;
