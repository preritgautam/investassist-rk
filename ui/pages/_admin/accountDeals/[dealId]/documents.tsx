import React, { useCallback, useState } from 'react';
import { PageComponent } from '../../../../src/bootstrap/types';
import { getAdminLayout } from '../../../../src/app/components/app/layouts/SuperAdminLayout';
import { PageContent } from '../../../../src/bootstrap/chakra/components/layouts/PageContent';
import { useQueryParam } from '../../../../src/bootstrap/hooks/utils/useQueryParam';
import { useRouter } from 'next/router';
import { useDealService } from '../../../../src/app/services/_admin/DealService';
import { DealDocument } from '../../../../src/types';
import { Button, chakra, HStack, IconButton, Tooltip } from '@chakra-ui/react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-balham.css';
import { ColDef, ICellRendererParams, ValueFormatterParams } from 'ag-grid-community';
import { DownloadIcon } from '../../../../src/app/components/app/icons';
import { DateTime } from 'luxon';

const DealDocumentsPage: PageComponent = () => {
  const router = useRouter();
  const dealName = router.query['dealName'];
  const dealId = useQueryParam('dealId');
  const dealService = useDealService();
  const docsQuery = dealService.useDealDocuments(dealId);

  return (
    <PageContent
      pageTitle={`Deal Documents - ${dealName}`}
      mainActionButton={(
        <Button size="xs" onClick={() => router.back()}>Go Back</Button>
      )}
    >
      {docsQuery.data && (
        <DocumentsTable documents={docsQuery.data}/>
      )}
    </PageContent>
  );
};


interface DocumentsTableProps {
  documents: DealDocument[];
}

function DocumentsTable({ documents }: DocumentsTableProps) {
  const dealService = useDealService();

  const downloadFile = useCallback(async (documentId, documentName) => {
    await dealService.downloadDealDocumentFile(documentId, documentName);
  }, [dealService]);

  const [colDefs] = useState<ColDef[]>([
    { field: 'name', filter: true, sortable: true, floatingFilter: true, initialWidth: 400 },
    { field: 'documentType', filter: true, sortable: true },
    { field: 'status', filter: true, sortable: true },
    {
      field: 'createdAt', filter: true, sortable: true, headerName: 'Uploaded On',
      valueFormatter: (params: ValueFormatterParams) => {
        return DateTime.fromISO(params.value).toLocaleString(DateTime.DATETIME_MED);
      },
    },
    {
      field: null,
      cellRenderer: (params: ICellRendererParams) => {
        const { data: document } = params;
        return (
          <HStack h="full">
            <Tooltip shouldWrapChildren={true} label="Download File">
              <IconButton
                aria-label="Download file" icon={<DownloadIcon/>}
                size="sm" variant="ghost"
                onClick={() => downloadFile(document.id, document.name)}
              />
            </Tooltip>
          </HStack>
        );
      },
    },
  ]);

  return (
    <chakra.div className="ag-theme-balham" w="full" h="full" mx={-4} mt={-4} pb={2}>
      <AgGridReact
        rowData={documents} columnDefs={colDefs}
      />
    </chakra.div>
  );
}


DealDocumentsPage.getLayout = getAdminLayout;

export default DealDocumentsPage;
