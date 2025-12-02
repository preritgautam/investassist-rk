import { useDealAndDocuments } from './useDealAndDocuments';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { useRentRollsCompData } from './useRentRollsCompData';
import { FlexCol } from '../../../../bootstrap/chakra/components/layouts/FlexCol';
import { Button, Flex, FormControl, FormLabel, Heading, Icon, Select } from '@chakra-ui/react';
import { DealDetailsTable } from './DealDetailsTable';
import { InplaceRentTable } from './InplaceRentTable';
import { MarketRentTable } from './MarketRentTable';
import { SqFtTable } from './SqFtTable';
import { AmountsType, BedsType, OccupancyType, RentType } from './RentrollComps';
import { DownloadIcon } from '../icons';
import { useDownloadCompsService } from '../../../services/deals/DownloadCompsService';

export interface ShowRentRollCompsProps {
  rentRolls: Record<string, string>;
}

export function ShowRentRollComps({ rentRolls }: ShowRentRollCompsProps) {
  const flat: [string, string][] = useMemo(() => {
    return Reflect.ownKeys(rentRolls).map((dealId: string) => [dealId, rentRolls[dealId]]);
  }, [rentRolls]);
  const { deals, documents } = useDealAndDocuments(flat);
  const downloadCompsService = useDownloadCompsService();

  const [amountsType, setAmountsType] = useState<AmountsType>('$/unit');
  const [rentType, setRentType] = useState<RentType>('netEffectiveRent');
  const [bedsType, setBedsType] = useState<BedsType>('beds');
  const [occupancy, setOccupancy] = useState<OccupancyType>('all');

  const summaryData = useRentRollsCompData(flat, bedsType);
  const dealDetailsRef = useRef<DealDetailsTable>();
  const inPlaceRentRef = useRef<InplaceRentTable>();
  const marketRentRef = useRef<MarketRentTable>();
  const sqftRef = useRef<SqFtTable>();

  const handleDownloadComps = useCallback(async () => {
    await downloadCompsService.downloadRentRollComps({
      dealDetails: dealDetailsRef.current.getTableData(),
      inPlaceRent: inPlaceRentRef.current.getTableData(),
      marketRent: marketRentRef.current.getTableData(),
      unitSize: sqftRef.current.getTableData(),
    });
  }, [downloadCompsService]);


  if (!summaryData) {
    return <div>Loading...</div>;
  }

  return (
    <FlexCol flexGrow={1} mt={3}>
      <Flex gap={8} py={1}>
        <FormControl display="flex" alignItems="center">
          <FormLabel mb={0}>Amounts</FormLabel>
          <Select
            defaultValue="$/unit" onChange={(e) => setAmountsType(e.target.value as AmountsType)} value={amountsType}
            size="xs"
          >
            <option value="$">$</option>
            <option value="$/unit">$/Unit</option>
            <option value="$/sqft">$/Sqft</option>
          </Select>
        </FormControl>

        <FormControl display="flex" alignItems="center">
          <FormLabel mb={0} flexShrink={0}>In Place Rent</FormLabel>
          <Select onChange={(e) => setRentType(e.target.value as RentType)} value={rentType} size="xs">
            <option value="netEffectiveRent">Net Effective Rent</option>
            <option value="monthlyRent">Monthly Rent</option>
          </Select>
        </FormControl>

        <FormControl display="flex" alignItems="center">
          <FormLabel mb={0} flexShrink={0}>Beds Configuration</FormLabel>
          <Select onChange={(e) => setBedsType(e.target.value as BedsType)} value={bedsType} size="xs">
            <option value="beds">Beds</option>
            <option value="bedsAndBaths">Beds And Baths</option>
          </Select>
        </FormControl>

        <FormControl display="flex" alignItems="center">
          <FormLabel mb={0} flexShrink={0}>Occupancy</FormLabel>
          <Select onChange={(e) => setOccupancy(e.target.value as OccupancyType)} value={occupancy} size="xs">
            <option value="all">All Units</option>
            <option value="occupied">Occupied Units</option>
          </Select>
        </FormControl>

        <Button
          size="xs" onClick={handleDownloadComps} variant="outline" flexShrink={0}
          leftIcon={<Icon as={DownloadIcon}/>} isDisabled={!summaryData}
        >Download Summary</Button>

      </Flex>
      <FlexCol flexGrow={1}>
        <Heading mt={4}>Property Details</Heading>
        <DealDetailsTable
          ref={dealDetailsRef}
          deals={deals} documents={documents} summaryData={summaryData} occupancy={occupancy}
        />

        <Heading mt={4}>In Place Rents</Heading>
        <InplaceRentTable
          deals={deals} documents={documents} summaryData={summaryData} ref={inPlaceRentRef}
          amountsType={amountsType} rentType={rentType} occupancy={occupancy}
        />

        <Heading mt={4}>Market Rents</Heading>
        <MarketRentTable
          deals={deals} documents={documents} summaryData={summaryData} ref={marketRentRef}
          amountsType={amountsType} occupancy={occupancy}
        />

        <Heading mt={4}>Unit Size (SF)</Heading>
        <SqFtTable
          deals={deals} documents={documents} summaryData={summaryData} occupancy={occupancy} ref={sqftRef}
        />
      </FlexCol>
    </FlexCol>
  );
}
