import React, { useCallback, useEffect, useState } from 'react';
import { FlexColProps } from '../../../../bootstrap/chakra/components/layouts/FlexCol';
import { XLSheet, XlsxPreview } from './XlsxPreview';
import { PdfPreview } from './PdfPreview';
import { FileData } from '../../../../types';
import { useDealDocumentsService } from '../../../services/account/user/DealDocumentsService';
import { noopFunc } from '../../../../bootstrap/utils/noop';

export interface OnLoadParams {
  numPages?: number;
  sheets?: XLSheet[];
}

export interface FilePreviewProps extends FlexColProps {
  // File instance or a url
  file: File | string | Blob;
  fileName: string;
  onFileLoad?: (onLoadParams: OnLoadParams) => void;
  activeSheet?: XLSheet;
}

export function FilePreview({ file, fileName, onFileLoad, activeSheet }: FilePreviewProps) {
  const isPdf = fileName.toLowerCase().endsWith('.pdf');
  const isXlsx = fileName.toLowerCase().endsWith('.xlsx');
  const onXlsxLoad = useCallback(({ sheets }) => {
    onFileLoad({ sheets });
  }, [onFileLoad]);

  return (
    <>
      {isPdf && file && (
        <PdfPreview file={file} onLoad={({ numPages }) => {
          onFileLoad({ numPages });
        }}/>
      )}
      {
        isXlsx && file && (
          <XlsxPreview file={file} onLoad={onXlsxLoad} activeSheet={activeSheet}/>
        )
      }
    </>
  );
}

interface DocumentOrFilePreviewProps {
  file: FileData;
  onFileLoad?: (onLoadParams: OnLoadParams) => void;
  activeSheet?: XLSheet;
}

export function DocumentOrFilePreview({ file, onFileLoad, activeSheet }: DocumentOrFilePreviewProps) {
  const dealDocumentsService = useDealDocumentsService();
  const [previewFile, setPreviewFile] = useState<File | string>(null);
  const fullFileName = file instanceof File ? file.name : file?.document.name;

  useEffect(() => {
    if (file instanceof File) {
      setPreviewFile(file);
    } else {
      if (file) {
        dealDocumentsService.getDealDocumentFileUrl(file.deal.id, file.document.id).then(
          (fileUrl) => setPreviewFile(fileUrl),
        );
      }
    }
  }, [file, dealDocumentsService]);

  return (
    <FilePreview
      file={previewFile} fileName={fullFileName} onFileLoad={onFileLoad} activeSheet={activeSheet}
    />
  );
}


export interface DocumentPreviewProps {
  dealId: string;
  documentId: string;
  fileName: string;
  deferLoad?: boolean;
}

export function DocumentPreview({ dealId, documentId, fileName, deferLoad = false }: DocumentPreviewProps) {
  const [fileUrl, setFileUrl] = useState<string>(null);
  const [fileBlob, setFileBlob] = useState<Blob>(null);
  const dealDocumentsService = useDealDocumentsService();

  // get file url as soon as possible
  useEffect(() => {
    if (!fileUrl && dealId && documentId) {
      dealDocumentsService.getDealDocumentFileUrl(dealId, documentId).then(
        (fileUrl) => setFileUrl(fileUrl),
      );
    }
  }, [dealId, documentId, fileUrl, dealDocumentsService]);

  // get file data as soon as we have the file url
  useEffect(() => {
    (async () => {
      if (fileUrl && !fileBlob) {
        const blob: Blob = await (await fetch(fileUrl)).blob();
        setFileBlob(blob);
      }
    })().catch(console.error);
  }, [fileUrl, fileBlob]);

  return (
    <FilePreview
      file={fileBlob} fileName={fileName} onFileLoad={noopFunc}
    />
  );
}
