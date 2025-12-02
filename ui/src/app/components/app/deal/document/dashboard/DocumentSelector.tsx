import { useRoutingService } from '../../../../../services/RoutingService';
import { Button, Icon, Menu, MenuButton, MenuDivider, MenuItem, MenuList, Text } from '@chakra-ui/react';
import { MenuDownIcon } from '../../../icons';
import { FlexCol } from '../../../../../../bootstrap/chakra/components/layouts/FlexCol';
import { shortDateIso } from '../../../../../../bootstrap/utils/dateFormat';
import React from 'react';
import { Deal, DealDocument } from '../../../../../../types';

interface DocumentSelectorProps {
  deal: Deal;
  currentDocument: DealDocument,
  validatedDocuments: DealDocument[],
}

export function DocumentSelector({ deal, currentDocument, validatedDocuments }: DocumentSelectorProps) {
  const routing = useRoutingService();
  return <Menu>
    <MenuButton
      as={Button} rightIcon={<Icon as={MenuDownIcon}/>}
      h={16} w="full" colorScheme="dark" variant="secondary"
    >
      <FlexCol align="flex-start" gap={1}>
        {currentDocument.name.length < 22 && (
          <Text fontSize="xs">{currentDocument.name}</Text>
        )}
        {currentDocument.name.length >= 22 && (
          <>
            <Text fontSize="xs">{currentDocument.name.substring(0, 22)}</Text>
            <Text fontSize="xs">{currentDocument.name.substring(22, 42)}...</Text>
          </>
        )}


        {currentDocument.documentType === 'RRF' && (
          <FlexCol align="flex-start">
            <Text fontSize={10} fontWeight="normal">As Of Date</Text>
            <Text fontSize={10} fontWeight="normal">{shortDateIso(currentDocument.asOnDate)}</Text>
          </FlexCol>
        )}
        {currentDocument.documentType === 'CF' && (
          <FlexCol align="flex-start">
            <Text fontSize={10} fontWeight="normal">Period</Text>
            <Text fontSize={10} fontWeight="normal">
              {shortDateIso(currentDocument.periodFrom)} - {shortDateIso(currentDocument.periodTo)}
            </Text>
          </FlexCol>
        )}
      </FlexCol>
    </MenuButton>
    <MenuList>
      {validatedDocuments.map((d, i) => (
        <React.Fragment key={d.id}>
          {i > 0 && (
            <MenuDivider/>
          )}
          <MenuItem key={d.id} onClick={() => routing.gotoDealDocumentPage(deal, d, true)}>
            <FlexCol align="flex-start" gap={1}>
              <Text fontSize="xs" fontWeight="medium">{d.name}</Text>
              {d.documentType === 'RRF' && (
                <FlexCol align="flex-start">
                  <Text fontSize="xs" fontWeight="normal">As Of Date</Text>
                  <Text fontSize="xs" fontWeight="normal">{shortDateIso(d.asOnDate)}</Text>
                </FlexCol>
              )}
              {d.documentType === 'CF' && (
                <FlexCol align="flex-start">
                  <Text fontSize="xs" fontWeight="normal">Period</Text>
                  <Text fontSize="xs" fontWeight="normal">
                    {shortDateIso(d.periodFrom)} - {shortDateIso(d.periodTo)}
                  </Text>
                </FlexCol>
              )}
            </FlexCol>
          </MenuItem>
        </React.Fragment>
      ))}
    </MenuList>
  </Menu>;
}
