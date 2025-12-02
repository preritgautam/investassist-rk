import { IHeaderParams } from 'ag-grid-community';
import { CFColumn } from '../../../../../../types';
import React, { useCallback, useRef } from 'react';
import { Button, Flex, Icon, IconButton, Text, VStack } from '@chakra-ui/react';
import { ClearIcon, ColumnMenuIcon } from '../../../icons';
import { ConfirmPopup } from '../../../../../../bootstrap/chakra/components/popups/ConfirmPopup';

interface CFStaticColumnHeaderProps extends IHeaderParams {
  cfColumn: CFColumn,
  clearClassification : () => void,
  isReadOnly: boolean,
}

export function CFStaticColumnHeader({
  cfColumn,
  enableMenu,
  showColumnMenu,
  column,
  clearClassification,
  isReadOnly,
}: CFStaticColumnHeaderProps) {
  const filterButtonRef = useRef(null);
  const handleFilter = useCallback(() => {
    showColumnMenu(filterButtonRef.current);
  }, [filterButtonRef, showColumnMenu]);
  const isFilterActive = column.isFilterActive();

  return (
    <Flex justify="space-between" align="flex-start" w="full" h="full">
      <VStack gap={0} justify='stretch' mt='10px' align="flex-start" w="full">
        <Flex justify="space-between" w="full" align="center">
          <Text fontSize="xs">{cfColumn.label}</Text>
          {enableMenu && (
            <IconButton
              ref={filterButtonRef} onClick={handleFilter}
              variant="ghost" size="xs" aria-label="column filter"
              icon={<Icon as={ColumnMenuIcon} fontSize={10}/>}
              colorScheme={isFilterActive ? 'warning' : 'gray'}
              isActive={isFilterActive}
            />
          )}

        </Flex>
        {cfColumn.label === 'Category' && !isReadOnly && (
          <>
            <ConfirmPopup
              title="Clear Classification?"
              message={`This action will clear all the classification.
              Do you want to continue?`}
              okText="Yes"
              onConfirm={clearClassification}
            >
              <Button
                size="xs" variant="outline" w="full"
                justifyContent="space-between" px={1}
                colorScheme="gray" rightIcon={<Icon as={ClearIcon}/>}
              >Clear Classification</Button>
            </ConfirmPopup>
          </>
        )}
      </VStack>
    </Flex>
  );
}
