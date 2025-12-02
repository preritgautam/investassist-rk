import React, { ReactElement, useCallback, useRef, useState } from 'react';
import {
  Box,
  Button, CloseButton, Flex,
  Heading,
  HStack,
  Modal,
  ModalBody,
  ModalContent, ModalHeader, Text,
} from '@chakra-ui/react';
import { FlexCol } from '../../../../../../bootstrap/chakra/components/layouts/FlexCol';
import { FileData } from '../../../../../../types';
import { XLSheet } from '../../../filePreview/XlsxPreview';
import { DocumentOrFilePreview } from '../../../filePreview/FilePreview';
import { PdfPageSelector } from './PdfPageSelector';
import { XlsxSheetSelector } from './XlsxSheetSelector';

interface UseDocumentPreviewProps {
  file: FileData;
  activeSheet?: XLSheet;
}

type UseDocumentPreviewReturn = {
  preview: ReactElement;
  numPages: number;
  sheets: XLSheet[];
}

function useDocumentPreview({ file, activeSheet }: UseDocumentPreviewProps): UseDocumentPreviewReturn {
  const [numPages, setNumPages] = useState(0);
  const [sheets, setSheets] = useState<XLSheet[]>([]);

  const handleFileLoad = useCallback(({ numPages, sheets }) => {
    setSheets(sheets);
    setNumPages(numPages);
  }, []);

  const preview = (
    <DocumentOrFilePreview file={file} onFileLoad={handleFileLoad} activeSheet={activeSheet}/>
  );

  return { preview, numPages, sheets };
}

interface DocumentTaggerHeaderProps {
  onClose: () => void;
  documentName: string;
}

function DocumentTaggerHeader({ onClose, documentName }: DocumentTaggerHeaderProps) {
  return (
    <ModalHeader p={0} paddingLeft={0}>
      {/* the paddingLeft above is needed, weird but that's how it works */}
      <Flex justify="space-between" borderBottom="1px solid" borderColor="border.500" p={4}>
        <HStack spacing={4}>
          <CloseButton onClick={onClose} size="lg" variant="secondary"/>
          <FlexCol>
            <Text fontSize="sm">Review Document Data</Text>
            <Heading size="sm">{documentName}</Heading>
          </FlexCol>
        </HStack>
      </Flex>
    </ModalHeader>
  );
}

export interface ConfirmData {
  file: FileData,
  startPage?: number,
  endPage?: number,
}

export interface DealDocumentTaggerModalProps {
  file: FileData,
  isOpen: boolean,
  onClose: () => void,
  onConfirm: (data: ConfirmData) => void,
}


export function DealDocumentTaggerModal({ file, onClose, isOpen, onConfirm }: DealDocumentTaggerModalProps) {
  const fullFileName = file instanceof File ? file.name : file?.document.name;
  const document = file instanceof File ? null : file?.document;

  const isPdf = fullFileName?.toLowerCase().endsWith('.pdf');
  const isXlsx = fullFileName?.toLowerCase().endsWith('.xlsx');
  const [activeSheet, setActiveSheet] = useState<XLSheet>(null);
  const pdfPagesRef = useRef<PdfPageSelector>(null);

  const { preview, numPages, sheets } = useDocumentPreview({ file, activeSheet });

  const handleSheetChange = useCallback((sheetValue: number) => {
    const sheet = sheets.find((s) => s.value === sheetValue);
    setActiveSheet(sheet);
  }, [sheets]);

  const handleProcess = useCallback(() => onConfirm({
    file,
    startPage: isPdf ? pdfPagesRef.current.value.start : (isXlsx ? activeSheet?.value ?? 1 : 1),
    endPage: isPdf ? pdfPagesRef.current.value.end : (isXlsx ? activeSheet?.value ?? 1 : 1),
  }), [file, isPdf, isXlsx, onConfirm, activeSheet?.value]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="full" scrollBehavior="inside">
      <ModalContent borderRadius="none" minH={0} overflow="auto">
        <DocumentTaggerHeader documentName={fullFileName} onClose={onClose}/>
        <ModalBody p={4} display="flex" minH={0} overflow="auto">
          <FlexCol flexGrow={1}>
            {preview}
          </FlexCol>
          <FlexCol w={96} flexGrow={0} flexShrink={0} px={2}>
            {(isPdf && numPages) ? (
              <>
                <Heading size="sm">Please select pages with relevant data to process the document</Heading>
                <PdfPageSelector
                  mt={8} numPages={numPages} ref={pdfPagesRef}
                  defaultStartPage={document?.startPage}
                  defaultEndPage={document?.endPage}
                />
              </>
            ) : null}

            {(isXlsx && sheets.length) ? (
              <>
                <Heading size="sm">Please select sheet with relevant data to process the document</Heading>
                <XlsxSheetSelector
                  mt={8} sheets={sheets} onSheetChange={handleSheetChange} activeSheetValue={activeSheet?.value}
                />
              </>
            ) : null}

            <Box flexGrow={1}/>

            <HStack justify="flex-end">
              <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
              <Button size="sm" onClick={handleProcess}>Continue</Button>
            </HStack>
          </FlexCol>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
