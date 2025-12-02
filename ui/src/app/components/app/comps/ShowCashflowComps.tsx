import { useCashflowsCompData } from './useCashflowsCompData';
import { useDealAndDocuments } from './useDealAndDocuments';
import { Button, Flex, FormControl, FormLabel, Icon, Select } from '@chakra-ui/react';
import { CashflowCompsRollup } from './CashflowCompsRollup';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { FlexCol } from '../../../../bootstrap/chakra/components/layouts/FlexCol';
import { DownloadIcon } from '../icons';
import { useDownloadCompsService } from '../../../services/deals/DownloadCompsService';
import { AmountsType } from './RentrollComps';

export interface ShowCashflowCompsProps {
  cashflows: Record<string, string>;
  compsOrRollUp: 'Comps' | 'Rollup';
}

export function ShowCashflowComps({ cashflows, compsOrRollUp }: ShowCashflowCompsProps) {
  const flat: [string, string][] = useMemo(
    () => Reflect.ownKeys(cashflows).map((dealId: string) => [dealId, cashflows[dealId]]),
    [cashflows],
  );

  const [amountsType, setAmountsType] = useState<AmountsType>('$/unit');

  const summaryData = useCashflowsCompData(flat);
  const { deals, documents } = useDealAndDocuments(flat);
  const cashflowCompsRollupRef = useRef<CashflowCompsRollup>();
  const downloadCompsService = useDownloadCompsService();

  const handleDownloadSummary = useCallback(async () => {
    const data = cashflowCompsRollupRef.current.getTableData();
    await downloadCompsService.downloadCashFlowSummary(data);
  }, [downloadCompsService]);

  if (!summaryData) {
    return <div>Loading...</div>;
  }

  return (
    <FlexCol flexGrow={1}>
      <Flex gap={8} py={1} justify="flex-start">
        <FormControl display="flex" alignItems="center" flexGrow={0} flexBasis="auto" width="auto">
          <FormLabel mb={0}>Amounts</FormLabel>
          <Select
            defaultValue="$/unit" onChange={(e) => setAmountsType(e.target.value as AmountsType)} value={amountsType}
            size="xs"
          >
            <option value="$">$</option>
            <option value="$/unit">$/Unit</option>
          </Select>
        </FormControl>
      </Flex>
      <Flex justifyContent="flex-end" mt={4}>
        <Button
          size="xs" onClick={handleDownloadSummary} variant="outline" flexShrink={0}
          leftIcon={<Icon as={DownloadIcon}/>} isDisabled={!summaryData}
        >Download Summary</Button>
      </Flex>
      <Flex flexGrow={1}>
        <CashflowCompsRollup
          cashflows={cashflows} deals={deals} documents={documents} summaryData={summaryData}
          compsOrRollUp={compsOrRollUp} ref={cashflowCompsRollupRef} amountsType={amountsType}
        />
      </Flex>
    </FlexCol>
  );
}
