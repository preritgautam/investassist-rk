import React from 'react';
import { PageComponent } from '../../../src/bootstrap/types';
import { getAccountUserLayout } from '../../../src/app/components/app/layouts/AccountUserLayout2';
import { FlexCol } from '../../../src/bootstrap/chakra/components/layouts/FlexCol';
import { Box, Heading, Text } from '@chakra-ui/react';
import { LinkButton } from '../../../src/bootstrap/chakra/components/core/LinkButton';
import CheckoutCancel from '../../../src/app/images/checkout-cancel.webp';
import Image from 'next/image';

const CheckoutCancelPage: PageComponent = () => {
  return (
    <FlexCol alignItems="center" w="full">
      <Heading size="lg" mt={8}>Oops!</Heading>
      <Box w="xl">
        <Image src={CheckoutCancel}/>
      </Box>
      <Text>The subscription checkout was not successful</Text>
      <LinkButton href="/admin/plan" variant="solid" mt={4}>Go back to Plans Page</LinkButton>
    </FlexCol>
  );
};

CheckoutCancelPage.getLayout = getAccountUserLayout;
export default CheckoutCancelPage;
