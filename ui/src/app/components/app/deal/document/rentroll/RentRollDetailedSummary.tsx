import React from 'react';
import { Icon, Tab, TabList, TabPanels, Tabs, Text } from '@chakra-ui/react';
import { Deal, DealDocument, RRFExtractedData } from '../../../../../../types';
import { FlexCol, FlexColProps } from '../../../../../../bootstrap/chakra/components/layouts/FlexCol';
import { TabPanel } from '@chakra-ui/tabs';
import { ChargeCodeSummary } from './ChargeCodeSummary';
import { OccupancySummary } from './OccupancySummary';
import { FloorPlanSummary } from './FloorPlanSummary';
import { ChargeCodeIcon, FloorPlanIcon, OccupancyIcon } from '../../../icons';


export interface RentRollDetailedSummaryProps extends FlexColProps {
  data: RRFExtractedData,
  onToggleView: () => void,
  deal: Deal;
  document: DealDocument;
}

export function RentRollDetailedSummary({ data, deal, document }: RentRollDetailedSummaryProps) {
  return (
    <FlexCol rounded="lg" border="1px solid" borderColor="border.500">
      <Tabs flexGrow={1} display="flex" flexDir="column" minH={0} size="sm">
        <TabList>
          <Tab py={4} gap={1}>
            <Icon as={ChargeCodeIcon}/>
            <Text>Charge Code</Text>
          </Tab>
          <Tab py={4} gap={2}>
            <Icon as={OccupancyIcon}/>
            <Text>Occupancy</Text>
          </Tab>
          <Tab py={4} gap={2}>
            <Icon as={FloorPlanIcon}/>
            <Text>Floor Plan</Text>
          </Tab>
        </TabList>
        <TabPanels display="flex" minH={0} flexGrow={1}>
          <TabPanel display="flex" minH={0} w="100%" p={0}>
            <ChargeCodeSummary data={data}/>
          </TabPanel>
          <TabPanel display="flex" minH={0} w="100%" p={0}>
            <OccupancySummary data={data}/>
          </TabPanel>
          <TabPanel display="flex" minH={0} w="100%" p={0}>
            <FloorPlanSummary data={data} deal={deal} document={document}/>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </FlexCol>
  );
}
