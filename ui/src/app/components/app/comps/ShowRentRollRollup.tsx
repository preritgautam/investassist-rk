import { useDealAndDocuments } from './useDealAndDocuments';
import { useRentRollRollupData } from './useRentRollRollupData';
import { RentRollsRollUpTable } from './RentRollsRollUpTable';
import React, { useCallback } from 'react';
import { Button, Flex, Icon } from '@chakra-ui/react';
import { DownloadIcon } from '../icons';
import { useDownloadCompsService } from '../../../services/deals/DownloadCompsService';
import { FlexCol } from '../../../../bootstrap/chakra/components/layouts/FlexCol';

interface ShowRentRollRollupProps {
  rentRolls: Record<string, string>;
}

export function ShowRentRollRollup({ rentRolls }: ShowRentRollRollupProps) {
  const flat: [string, string][] = Reflect.ownKeys(rentRolls).map((dealId: string) => [dealId, rentRolls[dealId]]);
  const { deals } = useDealAndDocuments(flat);
  const downloadCompsService = useDownloadCompsService();

  const data = useRentRollRollupData(flat, deals);

  const handleDownloadRollup = useCallback(async () => {
    await downloadCompsService.downloadRentRollRollup(data);
  }, [downloadCompsService, data]);

  if (!data) {
    return (
      <div>Loading...</div>
    );
  }

  return (
    <FlexCol w="full">
      <Flex justifyContent="flex-end" mt={4}>
        <Button
          size="xs" onClick={handleDownloadRollup} variant="outline"
          leftIcon={<Icon as={DownloadIcon}/>} isDisabled={!data}
        >Download Summary</Button>
      </Flex>
      <RentRollsRollUpTable data={data}/>
    </FlexCol>
  );
}
