import React from 'react';
import { FlexCol } from '../../../../../bootstrap/chakra/components/layouts/FlexCol';
import { Heading, Icon } from '@chakra-ui/react';
import { NoDealsIcon } from '../../../../../../../ui/public/assets/Icons/Icons';
import { AddDealButton } from '../../deals/AddDealButton';


export function NoDealsView() {
  return (
    <FlexCol py={16} align="center" border="none" rounded="sm" gap={8} mx={24}>
      <Icon as={NoDealsIcon} fontSize="150"/>
      <Heading size="xs" fontWeight="400">To begin your deal, click on Add Deal button</Heading>
      <AddDealButton size="sm">+ Add Deal</AddDealButton>
    </FlexCol>
  );
}
