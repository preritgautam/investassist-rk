import React, { useCallback, useMemo } from 'react';
import { PageComponent } from '../../../../../src/bootstrap/types';
import { useDealDocumentFromRoute } from '../../../../../src/app/hooks/deal/useDealDocumentFromRoute';
import { DealDocument, Deal } from '../../../../../src/types';
import { CashFlowDataEditor } from '../../../../../src/app/components/app/deal/document/cashFlow/CashFlowDataEditor';
import { RentRollDataEditor } from '../../../../../src/app/components/app/deal/document/rentroll/RentRollDataEditor';
import {
  DocumentReprocessorModal,
} from '../../../../../src/app/components/app/deal/document/tagging/DocumentReprocessorModal';
import { RoutingService, useRoutingService } from '../../../../../src/app/services/RoutingService';
import { useQueryParam } from '../../../../../src/bootstrap/hooks/utils/useQueryParam';
import { DocumentDashboard } from '../../../../../src/app/components/app/deal/document/dashboard/DocumentDashboard';
import { useIsSampleDeal } from '../../../../../src/app/hooks/deal/useIsSampleDeal';
import { Button, Center, Heading, Icon, Text, VStack } from '@chakra-ui/react';
import { WarningIcon } from '../../../../../src/app/components/app/icons';
import { AccountCoaContextProvider } from '../../../../../src/app/context/AccountCoaContext';
import { userSession } from '../../../../../src/userSession';


interface DocumentDataEditorProps {
  deal: Deal;
  document: DealDocument;
  closeUrl: string;
}

function DocumentDataEditor({ deal, document, closeUrl }: DocumentDataEditorProps) {
  if (document.documentType === 'CF') {
    return (
      <CashFlowDataEditor deal={deal} document={document} closeUrl={closeUrl}/>
    );
  }

  return (
    <RentRollDataEditor deal={deal} document={document} closeUrl={closeUrl}/>
  );
}

interface DocumentDataViewerProps {
  deal: Deal;
  document: DealDocument;
  closeUrl: string;
}

function DocumentDataViewer({ deal, document, closeUrl }: DocumentDataViewerProps) {
  return (
    <DocumentDashboard deal={deal} document={document} closeUrl={closeUrl}/>
  );
}


const DocumentPage: PageComponent = () => {
  const { user } = userSession.useAuthManager();
  const [deal, document] = useDealDocumentFromRoute();
  const closeUrl = `${RoutingService.userDealPageBaseUrl(deal?.slug)}/${useQueryParam('onClose') ?? 'documents'}`;
  const hasData = deal && document;
  const failed = hasData && document.status === 'Failed';
  const processed = hasData && document.status === 'Processed';
  const validated = hasData && document.status === 'Validated';
  const dealDoc = useMemo(() => ({ deal, document }), [deal, document]);

  const routing = useRoutingService();
  const handleClose = useCallback(async () => {
    await routing.goto({ url: closeUrl });
  }, [routing, closeUrl]);

  const isSampleDeal = useIsSampleDeal(deal);

  if ((processed || failed) && isSampleDeal) {
    return (

      <Center h="100vh">
        <VStack>
          <Icon as={WarningIcon} color="warning.500" fontSize={60}/>
          <Heading size="sm">Oops! Something is not right, you shouldn&apos;t be seeing this page!</Heading>
          <Text>Click following button to go back till we fix the issue</Text>
          <Button onClick={() => history.back()}>Go Back</Button>
        </VStack>
      </Center>
    );
  }

  return (
    <AccountCoaContextProvider accountId={user.accountId}>
      <>
        {processed && (
          <DocumentDataEditor deal={deal} document={document} closeUrl={closeUrl}/>
        )}
        {failed && (
          <DocumentReprocessorModal file={dealDoc} onClose={handleClose} isOpen={failed}/>
        )}
        {validated && (
          <DocumentDataViewer deal={deal} document={document} closeUrl={closeUrl}/>
        )}
      </>
    </AccountCoaContextProvider>
  );
};

export default DocumentPage;
