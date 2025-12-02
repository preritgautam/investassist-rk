import { Deal } from '../../../../types';
import { Tag, TagCloseButton, TagLabel } from '@chakra-ui/react';
import React from 'react';
import { Tooltip } from '../../core/Tooltip';

export interface DealTagProps {
  deal: Deal,
  onClose: (deal: Deal) => void;
}

export function DealTag({ deal, onClose }: DealTagProps) {
  const shortName = deal.name.length > 30 ? `${deal.name.substring(0, 27)}...` : deal.name;

  return (
    <Tag
      size="sm" borderRadius="sm" variant="outline" colorScheme="primary" px={2} py={1}
      background="primary.50"
    >
      <TagLabel>
        <Tooltip label={deal.name}>
          {shortName}
        </Tooltip>
      </TagLabel>
      <TagCloseButton onClick={() => onClose(deal)}/>
    </Tag>
  );
}

