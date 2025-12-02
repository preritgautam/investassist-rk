import React, { useCallback, useState } from 'react';
import { Deal } from '../../../../types';
import { DocumentsSelector } from './DocumentsSelector';
import { Button, Flex, Heading, HStack, Icon } from '@chakra-ui/react';
import { FlexCol } from '../../../../bootstrap/chakra/components/layouts/FlexCol';
import { GoBackIcon } from '../icons';
import { ShowRentRollComps } from './ShowRentRollComps';
import { ShowRentRollRollup } from './ShowRentRollRollup';


export interface RentrollCompsProps {
  deals: Deal[];
}

export function RentrollComps({ deals }: RentrollCompsProps) {
  const [currentMode, setCurrentMode] = useState<'DocSelection' | 'Comps' | 'Rollup'>('DocSelection');
  const [selectedRentRolls, setSelectedRentRolls] = useState<Record<string, string>>({});

  const handleOnCompare = useCallback((selectedDocs: Record<string, string>) => {
    setSelectedRentRolls(selectedDocs);
    setCurrentMode('Comps');
  }, []);

  const handleOnRollup = useCallback((selectedDocs: Record<string, string>) => {
    setSelectedRentRolls(selectedDocs);
    setCurrentMode('Rollup');
  }, []);

  if (currentMode === 'DocSelection') {
    return (
      <DocumentsSelector deals={deals} documentType="RRF" onCompare={handleOnCompare} onRollup={handleOnRollup}/>
    );
  }

  if (currentMode === 'Comps') {
    return (
      <FlexCol h="full">
        <Flex justifyContent="space-between" mt={4}>
          <Heading>Rentroll Comps</Heading>
          <HStack>
            <Button
              size="xs" onClick={() => setCurrentMode('DocSelection')} variant="outline"
              leftIcon={<Icon as={GoBackIcon}/>}
            >Go Back</Button>
          </HStack>
        </Flex>
        <ShowRentRollComps rentRolls={selectedRentRolls} />
      </FlexCol>
    );
  }

  if (currentMode === 'Rollup') {
    return (
      <FlexCol h="full">
        <Flex justifyContent="space-between" mt={4}>
          <Heading>Rentroll Rollup</Heading>
          <HStack>
            <Button
              size="xs" onClick={() => setCurrentMode('DocSelection')} variant="outline"
              leftIcon={<Icon as={GoBackIcon}/>}
            >Go Back</Button>
          </HStack>
        </Flex>
        <Flex flexGrow={1}>
          <ShowRentRollRollup rentRolls={selectedRentRolls}/>
        </Flex>
      </FlexCol>
    );
  }
}

export type AmountsType = '$' | '$/unit' | '$/sqft';
export type RentType = 'netEffectiveRent' | 'monthlyRent';
export type BedsType = 'beds' | 'bedsAndBaths';
export type OccupancyType = 'all' | 'occupied';


