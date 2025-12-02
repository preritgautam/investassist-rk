import { Button, chakra, CloseButton, Divider, Flex, Heading, HStack, Icon, IconButton, Text } from '@chakra-ui/react';
import { FlexCol } from '../../../../../../bootstrap/chakra/components/layouts/FlexCol';
import React, { useCallback } from 'react';
import { useFullScreenButton } from '../../../../../hooks/utils/UseFullScreen';
import { ConfirmPopup } from '../../../../../../bootstrap/chakra/components/popups/ConfirmPopup';
import {
  ConfirmIcon, CopyIcon,
  DiscrepancyIcon,
  DocumentDataView,
  DownloadIcon, HelpIcon,
  RedoIcon, ReverseRowSignIcon,
  SaveIcon,
  SummaryIcon,
  UndoIcon,
} from '../../../icons';
import { Tooltip } from '../../../../core/Tooltip';
import { FileIcon } from '../../../../core/FileIcon';
import { useIsFreeAccount } from '../../../../../hooks/deal/useIsFreeAccount';

interface CashFlowEditorHeaderProps {
  documentName: string;
  onClose: () => void;
  onSave: () => void;
  isSaving: boolean;
  summaryVisible: boolean;
  onToggleSummary: () => void;
  onDownload: () => void;
  showDocumentView: boolean;
  onToggleDocumentView: () => void;
  onCopyClassification: () => void;
  isUnsaved: boolean;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onValidate: () => void;
  onRaiseTicket: () => void;
  onReverseRowSign: () => void;
  rowsAreSelected: boolean;
  onToggleDiscrepancies: () => void;
  discrepanciesVisible: boolean;
  discrepanciesFound: boolean;
  highLightDiscrepancyRow: (row: number) => void;
}

export function CashFlowEditorHeader(
  {
    documentName,
    onClose,
    onSave,
    isSaving,
    summaryVisible,
    onToggleSummary,
    onDownload,
    showDocumentView,
    onToggleDocumentView,
    onCopyClassification,
    isUnsaved,
    canUndo, canRedo,
    onUndo, onRedo,
    onValidate,
    onRaiseTicket,
    onReverseRowSign,
    rowsAreSelected,
    onToggleDiscrepancies,
    discrepanciesVisible,
    discrepanciesFound,
    highLightDiscrepancyRow,
  }: CashFlowEditorHeaderProps,
) {
  const [fullScreenButton, exitFullScreen] = useFullScreenButton();

  const isFreeAccount = useIsFreeAccount();

  const handleClose = useCallback(async () => {
    let exit = true;
    if (isUnsaved) {
      exit = window.confirm('You have unsaved changes. Do you really want to close the Cash-Flow editor?');
    }
    if (exit) {
      await exitFullScreen();
      onClose();
    }
  }, [onClose, exitFullScreen, isUnsaved]);

  const handleViewDiscrepancies = useCallback(() => {
    if (summaryVisible) {
      onToggleSummary();
    }
    onToggleDiscrepancies();
    highLightDiscrepancyRow(null);
  }, [onToggleSummary, summaryVisible, onToggleDiscrepancies, highLightDiscrepancyRow]);


  const handleViewSummary = useCallback(() => {
    if (discrepanciesVisible) {
      onToggleDiscrepancies();
      highLightDiscrepancyRow(null);
    }
    onToggleSummary();
  }, [onToggleSummary, discrepanciesVisible, onToggleDiscrepancies, highLightDiscrepancyRow]);

  return (
    <FlexCol flexShrink={0}>
      <Flex justify="space-between" borderBottom="1px solid" borderColor="border.500" p={4} py={2}>
        <HStack spacing={4}>
          <CloseButton onClick={handleClose} size="lg" variant="secondary" colorScheme="dark"/>
          <FlexCol gap={2}>
            <Heading size="sm">{documentName}</Heading>
            <Text fontSize="sm" color="red.500" bg="red.50" px={2}>Review Cash Flow</Text>
          </FlexCol>
        </HStack>
        <HStack spacing={4}>
          <ConfirmPopup
            title="Validate Document?"
            message={`This action will mark the document as read only and will allow it to be used for model generation.
            Do you want to continue?`}
            okText="Yes"
            onConfirm={onValidate}
          >
            <Button
              minW={24} size="xs" aria-label="mark-validated" variant="solidInvert"
              colorScheme={isUnsaved ? 'warning' : 'success'}
              isDisabled={isUnsaved || isFreeAccount} leftIcon={<ConfirmIcon fontSize={16}/>}>
              Mark Validated
            </Button>
          </ConfirmPopup>

          <Tooltip label="Download Workbook">
            <Flex position="relative" align="flex-end">
              <IconButton
                aria-label="Download File"
                icon={<FileIcon fileName="abc.xls" fontSize="md"/>}
                colorScheme="dark" variant="secondary"
                size="xs" onClick={onDownload} isDisabled={isFreeAccount}
              />
              <Icon
                as={DownloadIcon} fontSize={8} position="relative" right={2} bottom={0} mr={-2} bg="#ffffff77"
                color="green.500"
              />
            </Flex>
          </Tooltip>

          <Tooltip label="Raise Help Ticket">
            <IconButton
              aria-label="Raise Ticket"
              icon={<HelpIcon fontSize="md"/>}
              colorScheme="danger" variant="secondary"
              size="xs" onClick={onRaiseTicket}
              isDisabled={isFreeAccount}
            />
          </Tooltip>
          <Divider orientation="vertical"/>
          {fullScreenButton}
        </HStack>
      </Flex>
      <Flex justify="space-between" borderX="1px solid" borderY="none" borderColor="border.500" p={0} pl={2}>
        <HStack>
          <Tooltip label={showDocumentView ? 'Show Data View' : 'Show Original Document'}>
            <IconButton
              aria-label={showDocumentView ? 'show data view' : 'show document view'}
              icon={
                showDocumentView ? <DocumentDataView fontSize={16}/> : <FileIcon fileName={documentName} fontSize={16}/>
              }
              variant="ghost" colorScheme="gray"
              onClick={onToggleDocumentView}
              mr="1px"
            />
          </Tooltip>
          <Divider orientation="vertical"/>
          <Tooltip label="Save Changes (Ctrl+S)">
            <chakra.span lineHeight={0}>
              <Button
                aria-label="Save Data" variant="ghost" colorScheme="primary" size="xs"
                leftIcon={<SaveIcon fontSize={16}/>} onClick={onSave} isLoading={isSaving}
                isDisabled={!isUnsaved || isFreeAccount}
              >Save</Button>
            </chakra.span>
          </Tooltip>
          <Tooltip label="Undo Changes (Ctrl+Z)">
            <chakra.span lineHeight={0}>
              <Button
                size="xs"
                aria-label="Undo" variant="ghost" colorScheme="primary"
                leftIcon={<UndoIcon fontSize={16}/>} isDisabled={!canUndo} onClick={onUndo}
              >Undo</Button>
            </chakra.span>
          </Tooltip>
          <Tooltip label="Redo Changes (Ctrl+Y)">
            <chakra.span lineHeight={0}>
              <Button
                size="xs"
                aria-label="Redo" variant="ghost" colorScheme="primary"
                leftIcon={<RedoIcon fontSize={16}/>} isDisabled={!canRedo} onClick={onRedo}
              >Redo</Button>
            </chakra.span>
          </Tooltip>
        </HStack>
        <HStack>
          <Button
            size="xs" variant="ghost" colorScheme="secondary" leftIcon={<ReverseRowSignIcon fontSize={16}/>}
            onClick={onReverseRowSign} isDisabled={!rowsAreSelected || isFreeAccount}
          >
            Reverse Row Signs
          </Button>
          <Button
            size="xs" variant="ghost" colorScheme="secondary" leftIcon={<CopyIcon fontSize={16}/>}
            onClick={onCopyClassification} isDisabled={isFreeAccount}
          >
            Copy Classification
          </Button>
          <Divider orientation="vertical"/>
          {discrepanciesFound && (
            <>
              <Tooltip label={discrepanciesVisible ? 'Hide Discrepancies' : 'Show Discrepancies'}>
                <Button
                  size="xs" variant="ghost" colorScheme="danger"
                  leftIcon={<Icon as={DiscrepancyIcon} fontSize="sm"/>}
                  onClick={handleViewDiscrepancies}
                >Discrepancies Detected</Button>
              </Tooltip>
              <Divider orientation="vertical"/>
            </>
          )
          }
          <Tooltip label={summaryVisible ? 'Hide Summary' : 'Show Summary'}>
            <chakra.span lineHeight={0}>
              <Button
                size="xs"
                aria-label="toggle summary" variant="ghost" colorScheme="primary"
                leftIcon={<SummaryIcon fontSize={16}/>} onClick={handleViewSummary}
              >Summary</Button>
            </chakra.span>
          </Tooltip>
        </HStack>
      </Flex>
    </FlexCol>
  );
}
