import React, { useState } from 'react';
import { PageComponent } from '../../../src/bootstrap/types';
import { getAdminLayout } from '../../../src/app/components/app/layouts/SuperAdminLayout';
import { useRouter } from 'next/router';
import { PageContent } from '../../../src/bootstrap/chakra/components/layouts/PageContent';
import { useDealService } from '../../../src/app/services/_admin/DealService';
import { Deal } from '../../../src/types';
import { ColDef, ICellRendererParams } from 'ag-grid-community';
import { Button, chakra, HStack, Tooltip } from '@chakra-ui/react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-balham.css';
import { FlexCol } from '../../../src/bootstrap/chakra/components/layouts/FlexCol';
import { DealDocumentsIcon } from '../../../src/app/components/app/icons';
import { LinkIconButton } from '../../../src/bootstrap/chakra/components/core/LinkButton';


const AdminAccountDealsPage: PageComponent = () => {
  const router = useRouter();
  const accountName = router.query['accountName'];
  const accountId = router.query['accountId'] as string;
  const dealService = useDealService();
  const dealsQuery = dealService.useAccountDeals(accountId);

  return (
    <PageContent
      pageTitle={`Account Deals - ${accountName}`}
      mainActionButton={(
        <Button size="xs" onClick={() => router.back()}>Go Back</Button>
      )}
    >
      <FlexCol flexGrow={1} mx={-4} mt={-4} pb={2}>
        {dealsQuery.data && (
          <DealsTable deals={dealsQuery.data}/>
        )}
      </FlexCol>
    </PageContent>
  );
};

interface DealsTableProps {
  deals: Deal[];
}

function DealsTable({ deals }: DealsTableProps) {
  const [colDefs] = useState<ColDef[]>([
    { field: 'name', filter: true, sortable: true, floatingFilter: true, initialWidth: 400 },
    { field: 'createdAt', filter: true, sortable: true, headerName: 'Created On' },
    { field: 'status', filter: true, sortable: true },
    {
      field: null, filter: false, sortable: false, headerName: 'Actions',
      cellRenderer: (params: ICellRendererParams) => {
        const { data: deal } = params;
        return (
          <HStack h="full">
            <Tooltip shouldWrapChildren={true} label="Show Documents">
              <LinkIconButton
                href={`/_admin/accountDeals/${deal.id}/documents?dealName=${deal.name}`}
                aria-label="show documents" icon={<DealDocumentsIcon/>} size="sm" variant="ghost"
              />
            </Tooltip>
          </HStack>
        );
      },

    },
  ]);

  return (
    <chakra.div className="ag-theme-balham" w="full" h="full">
      <AgGridReact
        rowData={deals} columnDefs={colDefs}
      />
    </chakra.div>
  );
}


AdminAccountDealsPage.getLayout = getAdminLayout;

export default AdminAccountDealsPage;
