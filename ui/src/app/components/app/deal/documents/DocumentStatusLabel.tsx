import { getDealDocumentStatusColor } from '../../../../services/utils/utils';
import { Box, Text } from '@chakra-ui/react';
import React from 'react';
import { DealDocument } from '../../../../../types';

interface DocumentStatusLabelProps {
  document: DealDocument;
}

export function DocumentStatusLabel({ document }: DocumentStatusLabelProps) {
  const color = getDealDocumentStatusColor(document.status);
  return (
    <Box rounded="full" px={2} py={1} borderWidth="2px" bg={`${color}.50`} borderColor={`${color}.200`} w="fit-content">
      <Text fontSize="xs">{document.status}</Text>
    </Box>
  );
}
