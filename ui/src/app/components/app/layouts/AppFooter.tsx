import React from 'react';
import { Footer } from '../../../../bootstrap/chakra/components/layouts/Footer';
import { BodyS } from '../../../../bootstrap/chakra/components/typography';

function AppFooter() {
  return (
    <Footer size={2} bg="#222" color="#ddd" align="center" px={2} boxShadow="md">
      <BodyS>
        © Copyright Clik.ai 2020
      </BodyS>
    </Footer>
  );
}

export { AppFooter };
