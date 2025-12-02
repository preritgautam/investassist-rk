import React, { ReactNode } from 'react';

import {
  AlignCenterIcon, AlignLeftIcon, AlignRightIcon, BoldIcon, FillColorIcon, FilterIcon, ItalicIcon,
  LockIcon, PaintFormatIcon, RedoIcon, SortAscendingIcon, SortDescendingIcon, TextColorIcon, UnderlineIcon, UndoIcon,
  UnlockIcon,
} from '../../app/icons';
import { SpreadSheetToolbarButton } from './SpreadSheetToolbarButton';
import { FormatMenuButton } from './FormatMenuButton';
import { noopFunc } from '../../../../bootstrap/utils/noop';
import {
  Button,
  ButtonGroup, ButtonProps, Divider, Flex, Popover, PopoverArrow, PopoverBody, PopoverContent,
  PopoverTrigger,
} from '@chakra-ui/react';
import { ColorPicker } from '../ColorPicker';


export const ACTIONS = {
  UNDO: 0,
  REDO: 1,

  FREEZE: 2,
  UNFREEZE: 3,

  SORT_ASCENDING: 4,
  SORT_DESCENDING: 5,

  FILL_CELL: 6,
  TEXT_COLOR: 7,

  TEXT_BOLD: 8,
  TEXT_ITALIC: 9,
  TEXT_UNDERLINE: 10,

  PAINT_FORMAT: 11,
  FILTER: 12,

  ALIGN_LEFT: 13,
  ALIGN_CENTER: 14,
  ALIGN_RIGHT: 15,

  FORMAT_CELL: 16,
};

export interface SpreadSheetToolbarProps {
  onAction: (action: number, data?: any) => void;
  customToolbarButtons: ReactNode;
  customRightChild: ReactNode;
  paintFormatActive: boolean;
  showDownloadButton: boolean;
  showToolbar: boolean;
  onDownload: ButtonProps['onClick'];
}

export function SpreadSheetToolbar(
  {
    onAction,
    customToolbarButtons = null,
    customRightChild = null,
    paintFormatActive = false,
    showDownloadButton = false,
    showToolbar = true,
    onDownload = noopFunc,
  }: SpreadSheetToolbarProps) {
  return showToolbar ? (
    <Flex justify="space-between" py={2} pl={2}>
      <Flex justify="flex-start">
        <ButtonGroup pr={2} isAttached>
          <SpreadSheetToolbarButton title="Undo" onClick={() => onAction(ACTIONS.UNDO)} icon={UndoIcon}/>
          <SpreadSheetToolbarButton title="Redo" onClick={() => onAction(ACTIONS.REDO)} icon={RedoIcon}/>
        </ButtonGroup>
        <Divider orientation="vertical"/>
        <ButtonGroup px={2} isAttached>
          <SpreadSheetToolbarButton
            title="Freeze Rows/Columns" onClick={() => onAction(ACTIONS.FREEZE)} icon={LockIcon}/>
          <SpreadSheetToolbarButton
            title="Unfreeze Rows/Columns" onClick={() => onAction(ACTIONS.UNFREEZE)} icon={UnlockIcon}/>
        </ButtonGroup>
        <Divider orientation="vertical"/>
        <ButtonGroup isAttached px={2}>
          <SpreadSheetToolbarButton
            title="Sort Ascending" onClick={() => onAction(ACTIONS.SORT_ASCENDING)} icon={SortAscendingIcon}/>
          <SpreadSheetToolbarButton
            title="Sort Descending" onClick={() => onAction(ACTIONS.SORT_DESCENDING)} icon={SortDescendingIcon}/>
        </ButtonGroup>
        <Divider orientation="vertical"/>
        <ButtonGroup px={2} isAttached>
          <Popover>
            <PopoverTrigger>
              <SpreadSheetToolbarButton title="Fill Cell Color" icon={FillColorIcon}/>
            </PopoverTrigger>
            <PopoverContent w="auto">
              <PopoverArrow/>
              <PopoverBody p={0}>
                <ColorPicker onChangeComplete={(color) => onAction(ACTIONS.FILL_CELL, { color })}/>
              </PopoverBody>
            </PopoverContent>
          </Popover>
          <Popover>
            <PopoverTrigger>
              <SpreadSheetToolbarButton title="Change Text Color" icon={TextColorIcon}/>
            </PopoverTrigger>
            <PopoverContent w="auto">
              <PopoverArrow/>
              <PopoverBody p={0}>
                <ColorPicker onChangeComplete={(color) => onAction(ACTIONS.TEXT_COLOR, { color })}/>
              </PopoverBody>
            </PopoverContent>
          </Popover>
        </ButtonGroup>
        <Divider orientation="vertical"/>
        <ButtonGroup px={2} isAttached>
          <SpreadSheetToolbarButton title="Bold" onClick={() => onAction(ACTIONS.TEXT_BOLD)} icon={BoldIcon}/>
          <SpreadSheetToolbarButton title="Italic" onClick={() => onAction(ACTIONS.TEXT_ITALIC)} icon={ItalicIcon}/>
          <SpreadSheetToolbarButton
            title="Underline" onClick={() => onAction(ACTIONS.TEXT_UNDERLINE)} icon={UnderlineIcon}/>
        </ButtonGroup>
        <Divider orientation="vertical"/>
        <ButtonGroup px={2} isAttached>
          <SpreadSheetToolbarButton
            title="Paint Format" onClick={() => onAction(ACTIONS.PAINT_FORMAT)}
            colorScheme={paintFormatActive ? 'warning' : undefined} icon={PaintFormatIcon}
          />
          <SpreadSheetToolbarButton
            title="Apply Row Filter" onClick={() => onAction(ACTIONS.FILTER)} icon={FilterIcon}/>
        </ButtonGroup>
        <Divider orientation="vertical"/>
        <ButtonGroup px={2} isAttached>
          <SpreadSheetToolbarButton
            title="Align Left" onClick={() => onAction(ACTIONS.ALIGN_LEFT)} icon={AlignLeftIcon}/>
          <SpreadSheetToolbarButton
            title="Align Center" onClick={() => onAction(ACTIONS.ALIGN_CENTER)} icon={AlignCenterIcon}/>
          <SpreadSheetToolbarButton
            title="Align Right" onClick={() => onAction(ACTIONS.ALIGN_RIGHT)} icon={AlignRightIcon}/>
        </ButtonGroup>
        <Divider orientation="vertical"/>
        <ButtonGroup px={2} isAttached>
          <FormatMenuButton onSelect={onAction}/>
        </ButtonGroup>
        {customToolbarButtons && (
          <>
            <Divider orientation="vertical"/>
            <ButtonGroup px={2} isAttached>
              {customToolbarButtons}
            </ButtonGroup>
          </>
        )}
      </Flex>
      <div className="flex">
        {showDownloadButton && (
          <Button size="xs" w={32} onClick={onDownload}>Download Xlsx</Button>
        )}
        {customRightChild}
      </div>
    </Flex>
  ) : null;
}
