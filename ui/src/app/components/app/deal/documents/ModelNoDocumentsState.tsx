import { Deal } from '../../../../../types';
import { FlexCol } from '../../../../../bootstrap/chakra/components/layouts/FlexCol';
import { Icon, Text } from '@chakra-ui/react';
import { LinkButton } from '../../../../../bootstrap/chakra/components/core/LinkButton';
import { RoutingService } from '../../../../services/RoutingService';
import React from 'react';
import { NoDocumentsIcon } from '../../../../../../public/assets/Icons/Icons';

export function ModelNoDocumentsState({ deal }: { deal: Deal }) {
  return (
    <FlexCol py={16} align="center" gap={2} mx={6}>
      <Icon as={NoDocumentsIcon} fontSize="200"/>
      <Text fontWeight="400" fontSize="sm" textAlign="center" mt={-2}>Documents are not available for now.</Text>
      <Text fontWeight="400" fontSize="sm" textAlign="center" mt={-2}>Click below to start uploading documents</Text>
      <LinkButton mt={4} href={RoutingService.userDealDocumentsPage(deal.slug)} variant="solid">Document</LinkButton>
    </FlexCol>
  );
}
