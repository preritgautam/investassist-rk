import { TabPanel, TabPanelProps } from '@chakra-ui/tabs';
import React, { ReactNode } from 'react';

interface TabPanel2Props extends TabPanelProps {
  children: ReactNode;
}

export function TabPanel2(props: TabPanel2Props) {
  return (
    <TabPanel minH={0} display="flex" flexDir="column" p={0} w="100%" overflow="auto" position="relative" {...props} />
  );
}
