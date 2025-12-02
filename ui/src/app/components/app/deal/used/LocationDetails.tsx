import React from 'react';
import { SimpleGrid, FormControl, FormLabel, Input, VStack, HStack } from '@chakra-ui/react';
import { requiredLabel } from '../../../../../bootstrap/chakra/components/core/form/RequiredLabel';
import { Deal } from '../../../../../types';

export interface LocationDetailsProps {
  deal: Deal | null;
}

export function LocationDetails({ deal }: LocationDetailsProps) {
  return (
    <SimpleGrid columns={2} spacingX={12} spacingY={2}>
      <VStack>
        <FormControl>
          <FormLabel>Property Name{requiredLabel}</FormLabel>
          <Input isReadOnly value={deal?.address?.line1}/>
        </FormControl>

        <FormControl>
          <FormLabel>Address</FormLabel>
          <Input isReadOnly value={deal?.address?.line2}/>
        </FormControl>
      </VStack>
      <VStack>
        <HStack w="100%">
          <FormControl>
            <FormLabel>City{requiredLabel}</FormLabel>
            <Input isReadOnly value={deal?.address?.city}/>
          </FormControl>

          <FormControl>
            <FormLabel>State{requiredLabel}</FormLabel>
            <Input isReadOnly value={deal?.address?.state}/>
          </FormControl>
        </HStack>

        <FormControl>
          <FormLabel>Zip Code{requiredLabel}</FormLabel>
          <Input isReadOnly value={deal?.address?.zipCode}/>
        </FormControl>
      </VStack>


      {/* <VStack>*/}
      {/*  <FormControl>*/}
      {/*    <FormLabel>Market</FormLabel>*/}
      {/*    <Input/>*/}
      {/*  </FormControl>*/}

      {/*  <FormControl>*/}
      {/*    <FormLabel>Parcel (APN)</FormLabel>*/}
      {/*    <Input/>*/}
      {/*  </FormControl>*/}

      {/*  <FormControl>*/}
      {/*    <FormLabel>Location Quality</FormLabel>*/}
      {/*    <Input/>*/}
      {/*  </FormControl>*/}

      {/*  <FormControl>*/}
      {/*    <FormLabel>Property Website</FormLabel>*/}
      {/*    <Input/>*/}
      {/*  </FormControl>*/}
      {/* </VStack>*/}
    </SimpleGrid>
  );
}
