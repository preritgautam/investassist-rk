import { RRFDataColumn } from '../../../../../../../types';
import { useBindCallback } from '../../../../../../../bootstrap/hooks/utils/useBindCallback';
import { Divider, Icon, IconButton, Menu, MenuButton, MenuItem, MenuList, Portal, Text } from '@chakra-ui/react';
import { ColumnMenuIcon } from '../../../../icons';
import { ConfirmPopup } from '../../../../../../../bootstrap/chakra/components/popups/ConfirmPopup';
import React from 'react';

interface RRColumnMenuProps {
  column: RRFDataColumn;
  onAddColumnBefore: (column: RRFDataColumn) => void;
  onAddColumnAfter: (column: RRFDataColumn) => void;
  onDeleteColumn: (column: RRFDataColumn) => void;
  readonly: boolean;
}

export function RRColumnMenu(
  { column, onAddColumnBefore, onAddColumnAfter, onDeleteColumn, readonly }: RRColumnMenuProps,
) {
  const handleAddColumnBefore = useBindCallback(onAddColumnBefore, column);
  const handleAddColumnAfter = useBindCallback(onAddColumnAfter, column);
  const handleDeleteColumn = useBindCallback(onDeleteColumn, column);
  return (
    <Menu>
      <MenuButton
        as={IconButton} icon={<Icon as={ColumnMenuIcon}/>} size="xs" variant="ghost" colorScheme="gray"
      >
        Actions
      </MenuButton>
      <Portal>
        <MenuList zIndex="popover" minW={32} p={0} rounded="none">
          <MenuItem onClick={handleAddColumnBefore} zIndex="popover" isDisabled={readonly}>
            <Text fontSize="xs">Add Column To Left</Text>
          </MenuItem>
          <MenuItem onClick={handleAddColumnAfter} isDisabled={readonly}>
            <Text fontSize="xs">Add Column To Right</Text>
          </MenuItem>
          {column.type !== 'fixed' && (
            <>
              <Divider/>
              <ConfirmPopup
                title="Delete Column?"
                message="Are you sure you want to delete this column? This action can not be undone."
                onConfirm={handleDeleteColumn}
                colorScheme="danger"
              >
                <MenuItem isDisabled={readonly}>
                  <Text fontSize="xs" color="danger.500">Delete Column</Text>
                </MenuItem>
              </ConfirmPopup>
            </>
          )}
        </MenuList>
      </Portal>
    </Menu>
  );
}
