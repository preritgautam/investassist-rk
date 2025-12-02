import React from 'react';
import { Deal, DealDocument } from '../../../../../../types';
import { AccountUserLayout } from '../../../layouts/AccountUserLayout2';
import { Content } from '../../../../../../bootstrap/chakra/components/layouts/Content';
import { Sidebar } from '../../../../../../bootstrap/chakra/components/layouts/sidebar/Sidebar';
import { Divider, Text } from '@chakra-ui/react';
import { useDealDocuments } from '../../../../../hooks/deal/useDealDocuments';
import { FlexCol } from '../../../../../../bootstrap/chakra/components/layouts/FlexCol';
import { DocumentSelector } from './DocumentSelector';
import { DealDetails } from './DealDetails';
import { RentRollDashboard } from './RentRollDashboard';
import { CashFlowDashboard } from './CashFlowDashboard';
import { DealPageLayoutProps, DealPagesNavigation } from '../../used/DealPageLayout';
import { useQueryParam } from '../../../../../../bootstrap/hooks/utils/useQueryParam';
import { CopyDealIdButton } from '../../used/CopyDealIdButton';


export interface DocumentDashboardProps {
  deal: Deal;
  document: DealDocument;
  closeUrl: string;
}

export const DocumentDashboard = ({ deal, document, closeUrl }: DocumentDashboardProps) => {
  const { documents } = useDealDocuments(deal, {
    refetchInterval: false,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: false,
  });
  const validatedDocuments = documents.filter((d) => d.status === 'Validated');
  const navId: DealPageLayoutProps['navId'] = useQueryParam('onClose') ?? 'documents';

  return (
    <AccountUserLayout>
      <Content>
        <Sidebar w={48} bg="primary.500">
          <DealDetails deal={deal}/>
          <CopyDealIdButton dealSlug={deal.slug}/>
          <Divider borderColor="white"/>
          <DealPagesNavigation deal={deal} navId={navId}/>
          <FlexCol w="full" p={2} gap={1} mt={3}>
            <Text color="dark.50" fontSize="sm">Select Document</Text>
            <DocumentSelector deal={deal} currentDocument={document} validatedDocuments={validatedDocuments}/>
          </FlexCol>
        </Sidebar>
        {document.documentType === 'RRF' && (
          <RentRollDashboard deal={deal} document={document} closeUrl={closeUrl}/>
        )}
        {document.documentType === 'CF' && (
          <CashFlowDashboard deal={deal} document={document} closeUrl={closeUrl}/>
        )}
      </Content>
    </AccountUserLayout>
  );
};

