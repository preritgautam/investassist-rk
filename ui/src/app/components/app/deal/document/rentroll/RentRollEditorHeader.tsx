import {
  Button,
  chakra,
  CloseButton,
  Divider,
  Flex,
  FormControl, FormControlProps, FormLabel,
  Heading,
  HStack, Icon,
  IconButton, Input, Select,
  Text,
} from '@chakra-ui/react';
import { FlexCol } from '../../../../../../bootstrap/chakra/components/layouts/FlexCol';
import React, { useCallback } from 'react';
import { Tooltip } from '../../../../core/Tooltip';
import { useFullScreenButton } from '../../../../../hooks/utils/UseFullScreen';
import { ConfirmPopup } from '../../../../../../bootstrap/chakra/components/popups/ConfirmPopup';
import {
  ConfirmIcon, DiscrepancyIcon,
  DocumentDataView,
  DownloadIcon, EditIcon,
  HelpIcon,
  RedoIcon,
  SaveIcon,
  SummaryIcon,
  UndoIcon,
} from '../../../icons';
import { ChargeCodeConfigButton } from './ChargeCodeConfigButton';
import { FPConfigButton } from './FPConfigButton';
import { OccupancyConfigButton } from './OccupancyConfigButton';
import { FileIcon } from '../../../../core/FileIcon';
import { RRFDataFieldType } from '../../../../../../types';
import { DateTime } from 'luxon';
import { useIsFreeAccount } from '../../../../../hooks/deal/useIsFreeAccount';


interface AsOnDateInputProps {
  value: string;
  onChange: (value: string) => void;
  wrapperProps?: FormControlProps,
}

function AsOnDateInput({ value, onChange, wrapperProps }: AsOnDateInputProps) {
  const handleChange = useCallback((e) => {
    if (e.target.value) {
      onChange(e.target.value);
    }
  }, [onChange]);

  const localValue = DateTime.fromISO(value).toLocaleString(DateTime.DATE_SHORT);

  return (
    <FormControl display="flex" flexDirection="row" alignContent="center" {...wrapperProps}>
      <label className="datepicker">
        <HStack>
          <FormLabel minW={16} m={0} lineHeight={2}>As Of Date:</FormLabel>
          <Text fontSize="xs">{localValue}</Text>
          <IconButton
            colorScheme="primary" variant="ghost" aria-label="Edit As On Date"
            icon={<Icon as={EditIcon}/>} size="xs"
          />
        </HStack>
        <Input type="date" value={value} size="xs" onChange={handleChange} required/>
      </label>
    </FormControl>
  );
}


interface RentRollEditorHeaderProps {
  documentName: string;
  onClose: () => void;
  onSave: () => void;
  isSaving: boolean;
  isUnsaved: boolean;
  onDownload: () => void;
  summaryVisible: boolean;
  onToggleSummary: () => void;
  showDocumentView: boolean;
  onToggleDocumentView: () => void;
  onConfigureChargeCodes: () => void;
  onConfigureOccupancy: () => void;
  onConfigureFloorPlan: () => void;
  allChargeCodesNotMapped: boolean;
  allOccupancyNotMapped: boolean;
  allFPNotMapped: boolean;
  disableOccupancy: boolean;
  disableChargeCodes: boolean;
  disableFloorPlan: boolean;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onValidate: () => void;
  onRaiseTicket: () => void;
  asOnDate: string;
  onAsOnDateChange: (value: string) => void;
  onToggleDiscrepancies: () => void;
  discrepanciesVisible: boolean;
  discrepanciesFound: boolean;
  highLightDiscrepancyRow: (rowIdx: number) => void;
  onShowColumnsChange: (columnType: RRFDataFieldType) => void;
  showColumns: RRFDataFieldType;
}

export function RentRollEditorHeader(
  {
    documentName,
    onClose,
    onSave,
    isSaving,
    onDownload,
    summaryVisible,
    onToggleSummary,
    showDocumentView,
    onToggleDocumentView,
    onConfigureChargeCodes,
    onConfigureOccupancy,
    onConfigureFloorPlan,
    isUnsaved,
    allChargeCodesNotMapped,
    allOccupancyNotMapped,
    disableOccupancy,
    disableChargeCodes,
    allFPNotMapped,
    disableFloorPlan,
    canUndo, canRedo,
    onUndo, onRedo,
    onValidate,
    onRaiseTicket,
    asOnDate,
    onAsOnDateChange,
    onToggleDiscrepancies,
    discrepanciesVisible,
    discrepanciesFound,
    highLightDiscrepancyRow,
    onShowColumnsChange,
    showColumns,
  }: RentRollEditorHeaderProps,
) {
  const [fullScreenButton, exitFullScreen] = useFullScreenButton();

  const isFreeAccount = useIsFreeAccount();
  const asOnDateIsValid = !!asOnDate;

  const canValidate = !isFreeAccount && !isUnsaved &&
    (disableOccupancy || !allOccupancyNotMapped) &&
    (disableChargeCodes || !allChargeCodesNotMapped) &&
    (disableFloorPlan || !allFPNotMapped) && asOnDateIsValid;

  let validateTooltip = isUnsaved ? 'Please save data' :
    allOccupancyNotMapped ? 'Please configure all occupancy status' :
      allChargeCodesNotMapped ? 'Please configure all charge codes' :
        allFPNotMapped ? 'Please configure all floor plans' :
          !asOnDateIsValid ? 'Please select a valid as of date' : '';
  validateTooltip += validateTooltip ? ' before you can mark document validated' : 'Mark document validated';

  const handleClose = useCallback(async () => {
    let exit = true;
    if (isUnsaved) {
      exit = window.confirm('You have unsaved changes. Do you really want to close the Rent-Roll editor?');
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
        <HStack spacing={4} flexGrow={1}>
          <CloseButton onClick={handleClose} size="lg" variant="secondary" colorScheme="dark"/>
          <FlexCol align="flex-start" flexGrow={1} gap={2}>
            <Heading size="sm">{documentName}</Heading>
            <Flex gap={2} w="full">
              <Text fontSize="sm" color="red.500" bg="red.50" px={2}>Review Rent Roll</Text>
              <AsOnDateInput value={asOnDate} onChange={onAsOnDateChange} wrapperProps={{ width: 'auto' }}/>
            </Flex>
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
            <chakra.span>
              <Tooltip label={validateTooltip} shouldWrapChildren>
                <Button
                  minW={24} size="xs" aria-label="mark-validated" variant="solidInvert"
                  colorScheme={!canValidate ? 'warning' : 'success'}
                  isDisabled={!canValidate} leftIcon={<ConfirmIcon fontSize={16}/>}
                >Mark Validated</Button>
              </Tooltip>
            </chakra.span>
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
                variant="ghost" colorScheme="primary" size="xs"
                leftIcon={<SaveIcon fontSize={16}/>} onClick={onSave} isLoading={isSaving}
                isDisabled={!isUnsaved || isFreeAccount}
              >Save</Button>
            </chakra.span>
          </Tooltip>
          <Tooltip label="Undo Changes (Ctrl+Z)">
            <chakra.span lineHeight={0}>
              <Button
                aria-label="Undo" variant="ghost" colorScheme="primary" size="xs"
                leftIcon={<UndoIcon fontSize={16}/>} isDisabled={!canUndo} onClick={onUndo}
              >Undo</Button>
            </chakra.span>
          </Tooltip>
          <Tooltip label="Redo Changes (Ctrl+Y)">
            <chakra.span lineHeight={0}>
              <Button
                aria-label="Redo" variant="ghost" colorScheme="primary" size="xs"
                leftIcon={<RedoIcon fontSize={16}/>} isDisabled={!canRedo} onClick={onRedo}
              >Redo</Button>
            </chakra.span>
          </Tooltip>
          <Divider orientation="vertical"/>
          <HStack>
            <Text fontSize="xs">Show</Text>
            <Select
              size="xs" value={showColumns}
              onChange={(e) => onShowColumnsChange(e.target.value as RRFDataFieldType)}
            >
              <option value="">All Columns</option>
              <option value="unitInformation">Unit Information</option>
              <option value="leaseTerms">Lease Terms</option>
              <option value="chargeCode">Tenant Charges</option>
              <option value="additionalDetails">Additional Details</option>
              <option value="fixed">Unit Configurations</option>
            </Select>
          </HStack>

        </HStack>
        <HStack>
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
          <ChargeCodeConfigButton
            isUnsaved={isUnsaved} onConfigureChargeCodes={onConfigureChargeCodes}
            allChargeCodesNotMapped={allChargeCodesNotMapped} isDisabled={disableChargeCodes || isFreeAccount}
          />
          <OccupancyConfigButton
            isUnsaved={isUnsaved} onConfigureOccupancy={onConfigureOccupancy}
            allOccupancyNotMapped={allOccupancyNotMapped} isDisabled={disableOccupancy || isFreeAccount}
          />
          <FPConfigButton
            isUnsaved={isUnsaved} onConfigureFloorPlan={onConfigureFloorPlan}
            allFPNotMapped={allFPNotMapped} isDisabled={disableFloorPlan || isFreeAccount}
          />
          <Divider orientation="vertical"/>
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
