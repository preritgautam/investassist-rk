import React, { ReactElement, ReactNode } from 'react';
import { Heading, HStack, VStack, Text } from '@chakra-ui/react';
import { FlexCol, FlexColProps } from '../../../../../bootstrap/chakra/components/layouts/FlexCol';
import { DealProperties } from './DealProperties';
import { PropertyDetails } from './PropertyDetails';
import { AmenityDetails } from './AmenityDetails';
import { ValuationDetails } from './ValuationDetails';
import { TransactionDetails } from './TransactionDetails';
import { PreviousSaleDetails } from './PreviousSaleDetails';
import { Card, CardProps } from '../../../core/Card';
import { Deal, DealDetails } from '../../../../../types';
import { Control, UseFormRegister } from 'react-hook-form';
import { LocationDetails } from './LocationDetails';
import { AddDealAddressButton } from '../../deals/AddDealAddressButton';

interface DetailsSectionProps extends Omit<CardProps, 'title'> {
  title: ReactNode,
  children: ReactElement,
}

function DetailsSection({ title, children, ...rest }: DetailsSectionProps) {
  return (
    <Card flexDir="column" border="1px solid" borderColor="border.500" rounded="sm" {...rest}>
      <Heading size="xs" mb={4}>{title}</Heading>
      {children}
    </Card>
  );
}

export interface AllDealDetailsProps extends FlexColProps {
  deal: Deal | null;
  details: DealDetails;
  register: UseFormRegister<DealDetails>;
  control: Control<DealDetails>;
  isReadOnlyMode: boolean;
}

export function AllDealDetails(
  { deal,
    details,
    register,
    control,
    isReadOnlyMode,
    ...rest }: AllDealDetailsProps,
) {
  return (
    <FlexCol p={4} pt={0} w="full" {...rest} className="no-scrollbar">
      <VStack align="stretch" spacing={8}>
        <DetailsSection title={
          <HStack>
            <Text>Location</Text>
            <AddDealAddressButton deal={deal} isDisabled={isReadOnlyMode}/>
          </HStack>
        } id="location-details">
          <LocationDetails deal={deal}/>
        </DetailsSection>
        <DetailsSection title="Deal Details" id="deal-details">
          <DealProperties register={register} control={control}/>
        </DetailsSection>

        <DetailsSection title="Property Details" id="property-details">
          <PropertyDetails control={control} register={register}/>
        </DetailsSection>

        <DetailsSection title="Amenities" id="amenities-details">
          <AmenityDetails control={control}/>
        </DetailsSection>

        <DetailsSection title="Valuation Details" id="valuation-details">
          <ValuationDetails control={control}/>
        </DetailsSection>

        <DetailsSection title="Transaction Details" id="transaction-details">
          <TransactionDetails control={control} register={register}/>
        </DetailsSection>

        <DetailsSection title="Previous Sale Details" id="previous-sale-details">
          <PreviousSaleDetails control={control} register={register}/>
        </DetailsSection>
      </VStack>
    </FlexCol>
  );
}
