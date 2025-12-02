import React, { useCallback } from 'react';
import { FlexCol } from '../../../../../bootstrap/chakra/components/layouts/FlexCol';
import {
  Center,
  CircularProgress,
  Heading,
  Text,
  HStack,
  IconButton, Flex,
} from '@chakra-ui/react';
import { Deal, DealModelHistory } from '../../../../../types';
import { DeleteIcon, DownloadIcon } from '../../icons';
import { downloadDealModelHistoryApi } from '../../../../api/accountUser';
import { saveAs } from 'file-saver';
import { useDealService } from '../../../../services/account/user/DealService';
import { useSimpleToast } from '../../../../hooks/utils/useSimpleToast';
import { ConfirmPopup } from '../../../../../bootstrap/chakra/components/popups/ConfirmPopup';
import { useBool } from '../../../../../bootstrap/hooks/utils/useBool';

interface DealModelHistoryProps {
  hasDocuments: boolean;
  deal: Deal;
  modelHistories: DealModelHistory[];
  isLoading: boolean;
}

export function DealModelHistory({ hasDocuments, deal, modelHistories, isLoading }: DealModelHistoryProps) {
  const [inProgress, startProgress, stopProgress] = useBool(false);
  const toast = useSimpleToast();
  const handleDownload = useCallback(async (history) => {
    startProgress();
    try {
      const response = await downloadDealModelHistoryApi({
        urlParams: { dealId: deal?.id, modelHistoryId: history.id },
      });
      saveAs(response.data, `${history?.name}.xlsm`);
    } catch (e) {
      toast({
        description: 'Model history download failed due to some unexpected error',
        title: 'Fail!',
        status: 'error',
      });
    }
    stopProgress();
  }, [deal?.id, startProgress, stopProgress, toast]);

  const dealService = useDealService();
  const deleteModelHistoryMutation = dealService.useDeleteDealModelHistory();

  const handleDelete = useCallback(async (history) => {
    await deleteModelHistoryMutation.mutateAsync({ dealId: deal?.id, modelHistoryId: history.id }, {
      onSuccess() {
        toast({
          title: 'Success!',
          description: `Model History '${history.name}' was successfully deleted.`,
        });
      },
    });
  }, [deleteModelHistoryMutation, deal?.id, toast]);

  return (
    <FlexCol w="100%" ml={0} borderWidth={1} roundedTopLeft="md" maxW={400}>
      <Heading size="sm" p={2} bg="gray.50" borderBottomWidth={1}>Model History</Heading>
      {isLoading && (
        <Center h="full">
          <CircularProgress isIndeterminate={true}/>
        </Center>
      )}
      {modelHistories?.length === 0 && (
        <Center flexGrow={1} px={6}>
          <Heading size="xs" textAlign="center">There are no models generated for the deal yet</Heading>
        </Center>
      )}
      <FlexCol gap={4} p={4}>
        {!!modelHistories.length && (
          modelHistories.map((history) => (
            <FlexCol key={history.id} gap={2} border="1px solid" borderColor="border.500" p={4} flexShrink={0}>
              <Flex align="center">
                <Text fontSize="sm" flexGrow={1} fontWeight="bold">{history.name}</Text>
                <HStack spacing={0}>
                  <IconButton
                    colorScheme="primary" variant="ghost" aria-label="Download History"
                    icon={<DownloadIcon fontSize={18}/>} onClick={() => handleDownload(history)} isLoading={inProgress}
                  />
                  <ConfirmPopup
                    title="Delete Model History?" onConfirm={() => handleDelete(history)}
                    message={`Are you sure you want to delete model history - ${history.name}?`}
                    colorScheme="danger"
                  >
                    <IconButton
                      colorScheme="danger" variant="ghost" aria-label="Delete History"
                      icon={<DeleteIcon fontSize={18}/>}
                      isDisabled={inProgress}
                    />
                  </ConfirmPopup>
                </HStack>
              </Flex>
              <Flex gap={8}>
                <FlexCol>
                  <Text fontSize="xs" color="gray.500">Generated On</Text>
                  <Text fontSize="xs">{new Date(history.createdAt).toLocaleString()}</Text>
                </FlexCol>
                <FlexCol>
                  <Text fontSize="xs" color="gray.500">Documents Used</Text>
                  <Text fontSize="xs" whiteSpace="normal" wordBreak="break-word">
                    {history.documents.map((doc) => doc.documentName).join(', ')}
                  </Text>
                </FlexCol>
              </Flex>
            </FlexCol>
          ))
        )}
      </FlexCol>
    </FlexCol>
  );
}
