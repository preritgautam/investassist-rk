import React, { ReactElement, useCallback } from 'react';
import { FlexCol } from '../../../../../../bootstrap/chakra/components/layouts/FlexCol';
import { Button, Flex, Heading, Icon } from '@chakra-ui/react';
import { DownloadIcon } from '../../../icons';
import { useCurrentPng } from 'recharts-to-png';
import FileSaver from 'file-saver';

export interface ChartWrapperProps {
  title: string;
  children: ReactElement;
}

export function ChartWrapper({ title, children }: ChartWrapperProps) {
  const [getPng, { ref }] = useCurrentPng();

  const handleDownload = useCallback(async () => {
    const png = await getPng();

    if (png) {
      FileSaver.saveAs(png, `${title}.png`);
    }
  }, [getPng, title]);
  return (
    <FlexCol flexGrow={1} flexShrink={0} w="50%" p={8}>
      <FlexCol rounded="sm" boxShadow="_md" w="full" h="full" bg="white">
        <Flex p={4} borderBottom="1px solid" borderColor="border.500" justify="space-between">
          <Heading>{title}</Heading>
          <Button size="xs" variant="secondary"
            leftIcon={<Icon as={DownloadIcon}/>}
            onClick={handleDownload}>Download
          </Button>
        </Flex>
        {React.cloneElement(children, { ref })}
      </FlexCol>
    </FlexCol>
  );
}
