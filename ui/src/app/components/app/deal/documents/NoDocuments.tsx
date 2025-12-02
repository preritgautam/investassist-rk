import React from 'react';
import { Icon, HStack, Heading } from '@chakra-ui/react';
import { FlexCol } from '../../../../../bootstrap/chakra/components/layouts/FlexCol';
import { NoDocumentsIcon } from '../../../../../../public/assets/Icons/Icons';
import { useIsFreeAccount } from '../../../../hooks/deal/useIsFreeAccount';


export interface NoDocumentsProps {
  isSampleDeal: boolean;
  rrUploadButton: React.ReactElement;
  cfUploadButton: React.ReactElement;
}

export function NoDocuments({ isSampleDeal, rrUploadButton, cfUploadButton }: NoDocumentsProps) {
  const isFreeAccount = useIsFreeAccount();

  const rrUploadButtonClone = React.cloneElement(rrUploadButton, { isDisabled: isSampleDeal || isFreeAccount });
  const cfUploadButtonClone = React.cloneElement(cfUploadButton, { isDisabled: isSampleDeal || isFreeAccount });

  return (
    <FlexCol py={16} align="center" border="none" rounded="sm" gap={6} mx={6}>
      <Icon as={NoDocumentsIcon} fontSize="200"/>
      <Heading size="xs" fontWeight="400" mt={-8} ml={2}>Upload your rent roll or cash flow statement</Heading>
      <HStack>
        {rrUploadButtonClone}
        {cfUploadButtonClone}
      </HStack>
    </FlexCol>
  );
}
