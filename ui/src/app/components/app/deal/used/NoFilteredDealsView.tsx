import React from 'react';
import { FlexCol } from '../../../../../bootstrap/chakra/components/layouts/FlexCol';
import { Button, Heading, Icon } from '@chakra-ui/react';
import { NoDealsFilterIcon } from '../../../../../../../ui/public/assets/Icons/Icons';

interface NoFilteredDealsViewParams {
  clearFilters: () => void;
}

export function NoFilteredDealsView({ clearFilters }: NoFilteredDealsViewParams) {
  return (
    <FlexCol py={16} align="center" border="none" rounded="sm" gap={8} mx={24}>
      <Icon as={NoDealsFilterIcon} fontSize="150"/>
      <Heading size="xs" fontWeight="400">No results found</Heading>
      <Button onClick={clearFilters} colorScheme="primary">Clear Filter</Button>
    </FlexCol>
  );
}
