import React, { useCallback } from 'react';
import { PageComponent } from '../../../src/bootstrap/types';
import { getAdminLayout } from '../../../src/app/components/app/layouts/SuperAdminLayout';
import { Button, HStack } from '@chakra-ui/react';
import { HeadingL } from '../../../src/bootstrap/chakra/components/typography';
import { PageContent } from '../../../src/bootstrap/chakra/components/layouts/PageContent';
import { useDealService } from '../../../src/app/services/_admin/DealService';
import { FlexCol } from '../../../src/bootstrap/chakra/components/layouts/FlexCol';

const AdminDealsPage: PageComponent = function() {
  const dealService = useDealService();
  const downloadReport = useCallback(async () => {
    await dealService.downloadDealReportFile();
  }, [dealService]);
  return (
    <PageContent
      pageTitle={(
        <HStack>
          <HeadingL>Deals</HeadingL>
        </HStack>
      )}
    >
      <FlexCol alignItems="flex-start">
        <Button onClick={downloadReport}>
          Download Deals Report
        </Button>
      </FlexCol>
    </PageContent>
  );
};

AdminDealsPage.getLayout = getAdminLayout;

export default AdminDealsPage;
