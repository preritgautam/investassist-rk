import React from 'react';
import { PageComponent } from '../../../../src/bootstrap/types';
import { getAccountUserLayout } from '../../../../src/app/components/app/layouts/AccountUserLayout2';
import { useDealByRouteSlug } from '../../../../src/app/hooks/deal/useDealByRouteSlug';
import { DealPageLayout } from '../../../../src/app/components/app/deal/used/DealPageLayout';
import { Center, CircularProgress, Flex, Heading, HStack, Text } from '@chakra-ui/react';
import {
  useDealDocumentUploadAndTagButton,
} from '../../../../src/app/components/app/deal/used/DealDocumentUploadAndTagButton';
import { useDealDocuments } from '../../../../src/app/hooks/deal/useDealDocuments';
import { FlexCol } from '../../../../src/bootstrap/chakra/components/layouts/FlexCol';
import { DocumentsTable } from '../../../../src/app/components/app/deal/documents/DocumentsTable';
import { NoDocuments } from '../../../../src/app/components/app/deal/documents/NoDocuments';
import { useIsSampleDeal } from '../../../../src/app/hooks/deal/useIsSampleDeal';
import { useIsFreeAccount } from '../../../../src/app/hooks/deal/useIsFreeAccount';


const DocumentsPage: PageComponent = function() {
  const [deal, isLoading, isError] = useDealByRouteSlug();
  const { cfDocuments, rrDocuments, isLoading: isLoadingDocuments } = useDealDocuments(deal);
  const isSampleDeal = useIsSampleDeal(deal);

  const isFreeAccount = useIsFreeAccount();

  const { uploads: rrUploads, uploadButton: rrUploadButton } = useDealDocumentUploadAndTagButton({
    documentType: 'RRF', deal, buttonProps: {
      variant: 'solid',
      children: 'Rent Roll',
      size: 'sm',
    },
  });
  const { uploads: cfUploads, uploadButton: cfUploadButton } = useDealDocumentUploadAndTagButton({
    documentType: 'CF', deal, buttonProps: {
      variant: 'solid',
      children: 'Cash Flow',
      size: 'sm',
    },
  });

  const getDisplayItems = () => {
    if (isLoading || isLoadingDocuments) {
      return (
        <Center h="full">
          <CircularProgress isIndeterminate={true}/>
        </Center>
      );
    }
    if (rrDocuments.length || cfDocuments.length ||
      Reflect.ownKeys(rrUploads).length || Reflect.ownKeys(cfUploads).length
    ) {
      return (
        <DocumentsTable
          deal={deal} rrDocuments={rrDocuments} cfDocuments={cfDocuments} rrUploads={rrUploads}
          cfUploads={cfUploads} isSampleDeal={isSampleDeal} isFreeAccount={isFreeAccount}
        />
      );
    } else {
      return <NoDocuments isSampleDeal={isSampleDeal} rrUploadButton={rrUploadButton} cfUploadButton={cfUploadButton}/>;
    }
  };

  const getHeader = () => {
    if (rrDocuments.length || cfDocuments.length) {
      return (
        <>
          <FlexCol>
            <Heading size="md">Documents</Heading>
            {isSampleDeal && (
              <Text fontSize="sm" color="warning.500" as="i">
                *This is a sample deal, you can only view documents and data
              </Text>
            )}
          </FlexCol>
          <HStack>
            {React.cloneElement(rrUploadButton, { isDisabled: isSampleDeal || isFreeAccount })}
            {React.cloneElement(cfUploadButton, { isDisabled: isSampleDeal || isFreeAccount })}
          </HStack>
        </>
      );
    } else {
      return (<></>);
    }
  };

  return (
    <DealPageLayout deal={deal} isLoading={isLoading} isError={isError} navId="documents">
      <FlexCol flexGrow={1}>
        <Flex p={4} pb={0} flexGrow={0} flexShrink={0} justify="space-between" align="center">
          {getHeader()}
        </Flex>
        <FlexCol flexGrow={1}>
          {getDisplayItems()}
        </FlexCol>
      </FlexCol>
    </DealPageLayout>
  );
};

DocumentsPage.getLayout = getAccountUserLayout;
export default DocumentsPage;
