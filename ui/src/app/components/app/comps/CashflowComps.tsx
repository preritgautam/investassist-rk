import React, { useCallback, useState } from 'react';
import { Deal } from '../../../../types';
import { DocumentsSelector } from './DocumentsSelector';
import { FlexCol } from '../../../../bootstrap/chakra/components/layouts/FlexCol';
import { Button, Flex, Heading, Icon } from '@chakra-ui/react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-balham.css';
import { GoBackIcon } from '../icons';
import { ShowCashflowComps } from './ShowCashflowComps';


export interface CashflowCompsProps {
  deals: Deal[];
}

export function CashflowComps({ deals }: CashflowCompsProps) {
  const [currentMode, setCurrentMode] = useState<'DocSelection' | 'Comps' | 'Rollup'>('DocSelection');
  const [selectedCashflows, setSelectedCashflows] = useState<Record<string, string>>({});

  const handleOnCompare = useCallback((selectedDocs: Record<string, string>) => {
    setSelectedCashflows(selectedDocs);
    setCurrentMode('Comps');
  }, []);

  const handleOnRollup = useCallback((selectedDocs: Record<string, string>) => {
    setSelectedCashflows(selectedDocs);
    setCurrentMode('Rollup');
  }, []);


  if (currentMode === 'DocSelection') {
    return (
      <DocumentsSelector deals={deals} documentType="CF" onCompare={handleOnCompare} onRollup={handleOnRollup}/>
    );
  }

  return (
    <FlexCol h="full">
      <Flex justifyContent="space-between" mt={4}>
        <Heading>Cashflow Comps</Heading>
        <Button
          size="xs" onClick={() => setCurrentMode('DocSelection')} variant="outline"
          leftIcon={<Icon as={GoBackIcon} />}
        >Go Back</Button>
      </Flex>
      <ShowCashflowComps cashflows={selectedCashflows} compsOrRollUp={currentMode}/>
    </FlexCol>
  );
}
