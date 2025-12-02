import React, { useCallback, useEffect, useMemo } from 'react';
import { PageComponent } from '../../../../src/bootstrap/types';
import { getAccountUserLayout } from '../../../../src/app/components/app/layouts/AccountUserLayout2';
import { Content } from '../../../../src/bootstrap/chakra/components/layouts/Content';
import { Sidebar } from '../../../../src/bootstrap/chakra/components/layouts/sidebar/Sidebar';
import {
  Button,
  chakra,
  Editable, EditableInput,
  EditablePreview,
  Flex,
  Heading,
  HStack,
  Icon,
  IconButton,
  Text, Tooltip, useEditableControls,
  VStack,
} from '@chakra-ui/react';
import { LinkButton, LinkButtonProps } from '../../../../src/bootstrap/chakra/components/core/LinkButton';
import { AllDealDetails } from '../../../../src/app/components/app/deal/used/AllDealDetails';
import { FlexCol } from '../../../../src/bootstrap/chakra/components/layouts/FlexCol';
import { DealPageLayout } from '../../../../src/app/components/app/deal/used/DealPageLayout';
import { useDealByRouteSlug } from '../../../../src/app/hooks/deal/useDealByRouteSlug';
import { useDealService } from '../../../../src/app/services/account/user/DealService';
import { useMixPanelService } from '../../../../src/app/services/MixPanelService';
import { useApiForm } from '../../../../src/bootstrap/hooks/utils/useApiForm';
import { DealDetails } from '../../../../src/types';
import { useSimpleToast } from '../../../../src/app/hooks/utils/useSimpleToast';
import { EditIcon } from '../../../../src/app/components/app/icons';
import { useAssignDealButton } from '../../../../src/app/components/app/deal/used/AssignDealButton';
import { DealStatusButton } from '../../../../src/app/components/app/deal/used/DealStatusButton';
import { useIsSampleDeal } from '../../../../src/app/hooks/deal/useIsSampleDeal';
import { useIsFreeAccount } from '../../../../src/app/hooks/deal/useIsFreeAccount';


function VLinkButton({ children, ...rest }: LinkButtonProps) {
  return (
    <LinkButton {...rest}>
      <Text fontSize="xs" sx={{ writingMode: 'vertical-rl' }}>{children}</Text>
    </LinkButton>
  );
}

const defaultDetails = {
  fund: 0,
};


function DealNameEditButton() {
  const { getEditButtonProps, isEditing } = useEditableControls();
  return isEditing ? null : (
    <IconButton
      variant="ghost" colorScheme="gray"
      aria-label="edit deal name" icon={<Icon as={EditIcon}/>}
      ml={1}
      {...getEditButtonProps()}
    />
  );
}

interface DealNameEditorProps {
  onChange: (value: string) => void;
  value: string;
  isReadOnly: boolean;
}

function DealNameEditor({ onChange, value, isReadOnly }: DealNameEditorProps) {
  const handleSubmit = useCallback((newValue: string) => {
    if (newValue !== value) {
      onChange(newValue);
    }
  }, [value, onChange]);

  return (
    <Heading size="md" w="full">
      <Tooltip label={value} openDelay={1500}>
        <>
          {!isReadOnly && (
            <Editable
              defaultValue={value} submitOnBlur={true} onSubmit={handleSubmit} mx={1} mt={1}
              isPreviewFocusable={true} display="flex"
            >
              <EditablePreview
                maxW={500} noOfLines={1} overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap"
                style={{ display: 'block' }} fontSize="lg"
              />
              <EditableInput pl={2} mb={1} fontSize="md" flexGrow={1} mr={8}/>
              <DealNameEditButton/>
            </Editable>
          )}
          {isReadOnly && (
            <Heading size="md" ml={1}>{value}</Heading>
          )}
        </>
      </Tooltip>
    </Heading>
  );
}


const DealPage: PageComponent = function() {
  const [deal, isLoading, isError, refetch] = useDealByRouteSlug();
  const dealService = useDealService();
  const dealDetailsQuery = dealService.useDealDetails(deal?.id);
  const dealDetails = dealDetailsQuery.data;
  const dealDetailsMutation = dealService.useUpdateDealDetails();
  const toast = useSimpleToast();
  const isSampleDeal = useIsSampleDeal(deal);
  const isFreeAccount = useIsFreeAccount();

  const isReadOnlyMode = isSampleDeal || isFreeAccount;

  const mixPanelService = useMixPanelService();
  const { updateDealMutation } = useDealService().useQueries();


  const onSubmit = useCallback(async (dealDetails: DealDetails) => {
    await dealDetailsMutation.mutateAsync({ dealId: deal?.id, dealDetails }, {
      onSuccess() {
        toast({
          title: 'Success!',
          description: 'Deal Details updated successfully',
          status: 'success',
        });
        mixPanelService.trackDealDetailsUpdatedEvent(deal);
      },
    });
  }, [deal, dealDetailsMutation, toast, mixPanelService]);

  const { handleSubmit, register, control, isSubmitting, reset } = useApiForm<DealDetails>({
    onSubmit,
    defaultValues: dealDetails,
  });

  const defaultValues = useMemo(() => {
    if (!dealDetails) return defaultDetails;
    const defaultValues = {};
    Reflect.ownKeys(dealDetails).forEach((k: string) => defaultValues[k] = dealDetails[k] ?? defaultDetails[k]);
    return defaultValues;
  }, [dealDetails]);

  useEffect(() => {
    reset(defaultValues);
  }, [reset, defaultValues]);

  const resetForm = useCallback(() => {
    reset({ ...defaultValues });
  }, [reset, defaultValues]);

  const assignDealButton = useAssignDealButton({ deal, buttonProps: { w: 64, flexGrow: 1 } });

  const handleDealNameChange = useCallback(async (value: string) => {
    await updateDealMutation.mutateAsync({ id: deal?.id, name: value }, {
      async onSuccess() {
        await refetch();
        toast({
          title: 'Success!',
          description: 'Deal name updated successfully',
          status: 'success',
        });
      },
    });
  }, [deal?.id, updateDealMutation, toast, refetch]);


  return (
    <DealPageLayout deal={deal} isLoading={isLoading} isError={isError} navId="overview">
      <Content flexDir="column">
        <Flex justify="space-between" ml={4} mr={16} py={6}>
          <FlexCol align="flex-start" flexGrow={1}>
            <DealNameEditor onChange={handleDealNameChange} value={deal?.name}
              isReadOnly={isReadOnlyMode}/>
            {!isSampleDeal && (
              <HStack ml={1}>
                <Text fontSize="xs" fontWeight="bold">Created By:</Text>
                <Text fontSize="xs" fontWeight="bold">{deal?.ownedByUser.name}</Text>
              </HStack>
            )}
            {isSampleDeal && (
              <Text color="warning.500" fontSize="sm" as="i">*This is a sample deal, you can not save any changes</Text>
            )}
          </FlexCol>
          <HStack>
            {!isReadOnlyMode && (
              <VStack align="flex-start">
                <Text fontSize="sm">Assigned To</Text>
                {assignDealButton}
              </VStack>
            )}
            <VStack align="flex-start">
              <Text fontSize="sm">Status</Text>
              <DealStatusButton deal={deal} variant={undefined} w={32} isDisabled={isReadOnlyMode}/>
            </VStack>
          </HStack>
        </Flex>
        <Flex flexGrow={1} minH={0} overflow="auto">
          <chakra.form id="deal-details-form" onSubmit={handleSubmit} minH={0} overflow="auto" display="flex" w="full">
            <AllDealDetails
              deal={deal} details={dealDetails} register={register} control={control} isReadOnlyMode={isReadOnlyMode}
            />
          </chakra.form>
          <Sidebar>
            <FlexCol>
              <VLinkButton mb={2} href="#location-details">Location</VLinkButton>
              <VLinkButton my={2} href="#deal-details">Details</VLinkButton>
              <VLinkButton my={2} href="#property-details">Property</VLinkButton>
              <VLinkButton my={2} href="#amenities-details">Amenities</VLinkButton>
              <VLinkButton my={2} href="#valuation-details">Valuation</VLinkButton>
              <VLinkButton my={2} href="#transaction-details">Transaction</VLinkButton>
              <VLinkButton my={2} href="#previous-sale-details">Previous Sale</VLinkButton>
            </FlexCol>
          </Sidebar>
        </Flex>
        <Flex p={4} py={2} pr={12} flexGrow={0} flexShrink={0} justify="flex-end" boxShadow="_md">
          <HStack justify="flex-end" my={4} mx={4}>
            <Button size="sm" variant="outline" onClick={resetForm} isDisabled={isReadOnlyMode}>
              Discard Changes
            </Button>
            <Button size="sm" type="submit" form="deal-details-form"
              isLoading={isSubmitting} isDisabled={isReadOnlyMode}>
              Save Changes
            </Button>
          </HStack>
        </Flex>
      </Content>
    </DealPageLayout>
  );
};

DealPage.getLayout = getAccountUserLayout;
export default DealPage;
