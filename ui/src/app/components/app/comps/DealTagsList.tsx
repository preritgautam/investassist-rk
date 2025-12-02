import React from 'react';
import { Button, Flex } from '@chakra-ui/react';
import { DealTag } from './DealTag';
import { Deal } from '../../../../types';

export interface DealTagsListProps {
  deals: Set<Deal>;
  onRemoveDeal: (deal: Deal) => void;
  onRemoveAllDeals: () => void;
}

export function DealTagsList({ deals, onRemoveDeal, onRemoveAllDeals }: DealTagsListProps) {
  if (deals.size === 0) {
    return null;
  }

  return (
    <Flex gap={2} flexWrap="wrap" mb={4} alignItems="center">
      <Button size="xs" onClick={onRemoveAllDeals}>Remove All</Button>
      {Array.from(deals).map((deal) => (
        <DealTag deal={deal} key={deal.id} onClose={onRemoveDeal}/>
      ))}
    </Flex>
  );
}
