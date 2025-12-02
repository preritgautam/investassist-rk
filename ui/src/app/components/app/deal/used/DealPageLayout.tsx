import { Deal } from '../../../../../types';
import React, { ReactNode } from 'react';
import { AddressIcon, AssumptionsIcon, DealDetailsIcon, DealDocumentsIcon, DealModelIcon } from '../../icons';
import { RoutingService } from '../../../../services/RoutingService';
import { Center, Divider, Heading, HStack, Icon, Spinner, Text, VStack } from '@chakra-ui/react';
import { Content } from '../../../../../bootstrap/chakra/components/layouts/Content';
import { Sidebar } from '../../../../../bootstrap/chakra/components/layouts/sidebar/Sidebar';
import { LinkButton } from '../../../../../bootstrap/chakra/components/core/LinkButton';
import { CopyDealIdButton } from './CopyDealIdButton';

export interface DealPageLayoutProps {
  deal: Deal,
  isLoading: boolean,
  isError: boolean,
  children: ReactNode,
  navId: 'overview' | 'documents' | 'assumptions' | 'models',
}

const links = [
  { id: 'documents', label: 'Documents', icon: DealDocumentsIcon, url: '/documents' },
  { id: 'overview', label: 'Deal Details', icon: DealDetailsIcon, url: '/deal' },
  { id: 'assumptions', label: 'Assumptions', icon: AssumptionsIcon, url: '/assumptions' },
  { id: 'models', label: 'Models', icon: DealModelIcon, url: '/models' },
];

export function DealPagesNavigation({ deal, navId }: { deal: Deal, navId: DealPageLayoutProps['navId'] }) {
  const dealBaseUrl = RoutingService.userDealPageBaseUrl(deal?.slug);

  return (
    <VStack align="stretch" pl={4} my={6}>
      {links.map((link) => (
        <LinkButton
          key={link.id} href={`${dealBaseUrl}${link.url}`}
          leftIcon={<Icon as={link.icon}/>}
          underline={false} variant={navId === link.id ? 'secondary' : 'solid'}
          bg={navId === link.id ? 'white' : 'undefined'}
          anchorProps={{ textAlign: 'left' }}
          w="100%" roundedRight="none" justifyContent="flex-start"
        >
          {link.label}
        </LinkButton>
      ))}
    </VStack>
  );
}


export function DealPageLayout({ deal, isLoading, isError, children, navId }: DealPageLayoutProps) {
  let content: ReactNode;
  if (isLoading) {
    content = (
      <Center flexGrow={1}>
        <Spinner size="xl"/>
      </Center>
    );
  } else if (isError) {
    content = (
      <Center h="100%">
        <VStack>
          <Heading size="md" color="danger.500">Oops! There was an error</Heading>
          <Text mt={8} fontSize="md">Please try again later in some time</Text>
        </VStack>
      </Center>
    );
  } else {
    content = children;
  }

  return (
    <Content>
      <Sidebar w={48} bg="primary.500">
        <VStack align="flex-start" p={4} color="text.900">
          <Heading size="sm" mb={1} maxW={40}>{deal?.name}</Heading>
          <HStack spacing={1} align="flex-start">
            <Icon as={AddressIcon} fontSize="md"/>
            <VStack align="flex-start" spacing={0}>
              <Text fontSize="sm">{deal?.address.line1}</Text>
              <Text fontSize="sm">{deal?.address.city}, {deal?.address.state}</Text>
              <Text fontSize="sm">Zip - {deal?.address.zipCode}</Text>
            </VStack>
          </HStack>
        </VStack>
        <CopyDealIdButton dealSlug={deal?.slug}/>
        <Divider borderColor="white"/>
        <DealPagesNavigation deal={deal} navId={navId}/>
      </Sidebar>
      {content}
    </Content>
  );
}
