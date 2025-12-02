import React, { useMemo } from 'react';
import { AccountUser, Deal } from '../../../../types';
import { Box, Flex } from '@chakra-ui/react';
import { FlexCol } from '../../../../bootstrap/chakra/components/layouts/FlexCol';
import { cardH, cardW, DealCard } from './DealCard';
import { useMeasure } from 'react-use';

export interface DealsGridViewProps {
  deals: Deal[];
  accountUsers: AccountUser[],
}

export function DealsGridView({ deals, accountUsers }: DealsGridViewProps) {
  // Some magic to pad extra empty deal boxes so that last row in the wrap is not screwed
  const [containerRef, { width: containerWidth }] = useMeasure();
  const dealsPerRow = Math.floor(containerWidth / cardW);
  const dealsInLastRow = dealsPerRow ? deals.length % dealsPerRow : 0;
  const dealsToPad = dealsInLastRow ? dealsPerRow - dealsInLastRow : 0;
  const paddedDeals = useMemo(() => {
    return new Array(dealsToPad).fill(0);
  }, [dealsToPad]);

  return (
    <FlexCol flexGrow={1} align="stretch" className="no-scrollbar" pt={4}>
      <Flex wrap="wrap" justify="center" ref={containerRef}>
        {
          deals.map((deal) => (
            <Box key={deal.id} p={4}>
              <DealCard key={deal.id} deal={deal} accountUsers={accountUsers}/>
            </Box>
          ))
        }
        {
          paddedDeals.map((_, i) => (
            <Box key={i} p={4}>
              <Box w={cardW} h={cardH}/>
            </Box>
          ))
        }
      </Flex>
    </FlexCol>
  );
}
