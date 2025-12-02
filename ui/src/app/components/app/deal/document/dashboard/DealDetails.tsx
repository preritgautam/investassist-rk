import { Heading, HStack, Icon, Text, VStack } from '@chakra-ui/react';
import { AddressIcon } from '../../../icons';
import React from 'react';
import { Deal } from '../../../../../../types';

interface DealDetailsProps {
  deal: Deal;
}

export function DealDetails({ deal }: DealDetailsProps) {
  return (
    <VStack align="flex-start" p={4} color="text.900">
      <Heading size="sm" mb={1}>{deal?.name}</Heading>
      <HStack spacing={1} align="flex-start">
        <Icon as={AddressIcon} fontSize="md"/>
        <VStack align="flex-start" spacing={0}>
          <Text fontSize="sm">{deal?.address.line1}</Text>
          <Text fontSize="sm">{deal?.address.city}, {deal?.address.state}</Text>
          <Text fontSize="sm">Zip - {deal?.address.zipCode}</Text>
        </VStack>
      </HStack>
    </VStack>
  );
}
