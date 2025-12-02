import React, { ReactElement, useCallback, useState } from 'react';
import { FlexCol } from '../../../../bootstrap/chakra/components/layouts/FlexCol';
import { DealAddress } from '../../../../types';
import { Box, FormControl, FormLabel, HStack, Input, StackProps, Text, VStack } from '@chakra-ui/react';
import { requiredLabel } from '../../../../bootstrap/chakra/components/core/form/RequiredLabel';
import { FieldErrorMessage } from '../../../../bootstrap/chakra/components/core/form/FieldErrorMessage';
import { useMeasure } from 'react-use';
import Downshift from 'downshift';
import { useDealService } from '../../../services/account/user/DealService';
import { FieldErrors } from 'react-hook-form';
import { Fieldset } from '../../core/Fieldset';


interface Location {
  /* eslint-disable camelcase */
  place_id: string;
  name: string;
  formatted_address: string;
  address_components: {
    long_name: string;
    types: string[];
  }[];
  /* eslint-enable camelcase */
}

interface Place {
  /* eslint-disable camelcase */
  place_id: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
  /* eslint-enable camelcase */
}

function getComponentValue(addressComponents: Location['address_components'], componentName: string) {
  const foundComponent = addressComponents.find((component) => component.types.includes(componentName));
  return foundComponent?.long_name ?? '';
}

function getLocationDetails(details: Location) {
  const googlePlaceId = details.place_id;
  const components = details.address_components;
  const addressLine1 = details?.name;
  const addressLine2 = `${getComponentValue(components, 'street_number')} ${getComponentValue(components, 'route')}`;
  const city = getComponentValue(components, 'locality');
  const state = getComponentValue(components, 'administrative_area_level_1');
  const zip = getComponentValue(components, 'postal_code');

  const formattedAddress = details.formatted_address;
  return {
    googlePlaceId, city, state, zip, formattedAddress, addressLine1, addressLine2,
  };
}

export interface AddressLine1InputProps {
  inputValue: string;
  onInputChange: (value: string) => void;
  onSelectItem: (placeId: Place['place_id']) => void;
  items: Place[];
}

export function AddressLine1Input({ items, inputValue, onSelectItem, onInputChange }: AddressLine1InputProps) {
  const handleSelect = useCallback((place: Place) => {
    if (place) {
      onSelectItem(place.place_id);
    }
  }, [onSelectItem]);

  const handleInputChange = useCallback((value: string) => {
    onInputChange(value);
  }, [onInputChange]);

  const [inputRef, { width: inputWidth }] = useMeasure();

  return (
    <Downshift
      inputValue={inputValue}
      onInputValueChange={handleInputChange}
      onSelect={handleSelect}
      itemToString={(item: Place) => item?.structured_formatting.main_text ?? inputValue}
    >
      {(
        {
          getInputProps,
          getItemProps,
          getMenuProps,
          isOpen,
          highlightedIndex,
          getRootProps,
        },
      ) => (
        <Box position="relative">
          <FlexCol ref={inputRef}>
            <HStack {...getRootProps({ refKey: 'ref' }, { suppressRefError: true })}>
              <Input {...getInputProps()} autoComplete="new-password"/>
            </HStack>
          </FlexCol>

          {!!items.length && isOpen && (
            <FlexCol
              position="absolute" overflow="scroll" w={inputWidth}
              border="1px" borderColor="border.500" rounded="sm" bg="white"
              zIndex={1500}
              {...getMenuProps()}
            >
              {isOpen && items.map((item: Place, index: number) => (
                <FlexCol
                  key={item.place_id}
                  py={2} px={4} bg={index === highlightedIndex ? 'gray.50' : undefined} borderBottom="1px"
                  borderColor="border.500" cursor="pointer" flexShrink={0}
                  {...getItemProps({ key: item.place_id, index, item })}
                >
                  <Text fontSize="sm" fontWeight="bold">{item?.structured_formatting?.main_text ?? ''}</Text>
                  <Text fontSize="sm">{item?.structured_formatting?.secondary_text ?? ''}</Text>
                </FlexCol>
              ))}
            </FlexCol>
          )}
        </Box>
      )}
    </Downshift>
  );
}

const emptyAddress: DealAddress = {
  line1: '',
  line2: '',
  city: '',
  state: '',
  zipCode: '',
};

export interface DealAddressFieldProps {
  value?: DealAddress;
  errors?: FieldErrors<DealAddress>;
  onChange: (value: DealAddress) => void;
  wrapperProps?: StackProps,
  dealNameField?: ReactElement,
}

export function DealAddressField(
  { value, onChange, errors, dealNameField = null, wrapperProps = {} }: DealAddressFieldProps,
) {
  const dealService = useDealService();
  const [places, setPlaces] = useState([]);
  const [addressLine1, setAddressLine1] = useState(value?.line1);

  const handleChangeField = useCallback((field, fieldValue) => {
    onChange({
      ...(value ?? emptyAddress),
      [field]: fieldValue,
    });
  }, [onChange, value]);

  const onChangeInput = useCallback(async (searchText) => {
    setAddressLine1(searchText);
    handleChangeField('line1', searchText);
    const places = await dealService.getGooglePlacesSuggestion(searchText);
    setPlaces(places);
  }, [dealService, handleChangeField]);

  const onSelectPlace = useCallback(async (placeId) => {
    const placeDetails = await dealService.getDetailsByPlaceId(placeId);
    const { city, state, zip, addressLine1, addressLine2 } = getLocationDetails(placeDetails);
    setAddressLine1(addressLine1);
    onChange({
      line1: addressLine1,
      line2: addressLine2,
      city: city,
      state: state,
      zipCode: zip,
    });
  }, [dealService, onChange]);


  return (
    <VStack align="stretch" spacing={4} {...wrapperProps}>
      <FormControl>
        <FormLabel>Property Name{requiredLabel}</FormLabel>
        <AddressLine1Input
          inputValue={addressLine1} onInputChange={onChangeInput} onSelectItem={onSelectPlace}
          items={places}
        />
      </FormControl>
      {dealNameField}
      <Fieldset label={<>Property Address</>}>
        <VStack align="stretch">
          <HStack>
            <FormControl>
              <FormLabel>Address{requiredLabel}</FormLabel>
              <Input
                autoComplete="off"
                value={value?.line2}
                onChange={(e) => handleChangeField('line2', e.target.value)}
              />
              <FieldErrorMessage error={errors?.line2}/>
            </FormControl>
            <FormControl>
              <FormLabel>City{requiredLabel}</FormLabel>
              <Input
                autoComplete="off"
                value={value?.city}
                onChange={(e) => handleChangeField('city', e.target.value)}
                pattern="[A-Za-z ]*" title="Only alphabets and spaces are allowed"
              />
              <FieldErrorMessage error={errors?.city}/>
            </FormControl>
          </HStack>

          <HStack>
            <FormControl>
              <FormLabel>State{requiredLabel}</FormLabel>
              <Input
                value={value?.state}
                onChange={(e) => handleChangeField('state', e.target.value)}
                pattern="[A-Za-z ]*" title="Only alphabets and spaces are allowed"
              />
              <FieldErrorMessage error={errors?.state}/>
            </FormControl>
            <FormControl>
              <FormLabel>Zip Code{requiredLabel}</FormLabel>
              <Input
                value={value?.zipCode}
                onChange={(e) => handleChangeField('zipCode', e.target.value)}
              />
              <FieldErrorMessage error={errors?.zipCode}/>
            </FormControl>
          </HStack>
        </VStack>
      </Fieldset>
    </VStack>
  );
}
