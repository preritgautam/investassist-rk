import { DealDocument } from '../../../../../types';
import { Text } from '@chakra-ui/react';
import React from 'react';
import { DateTime } from 'luxon';

export function DocumentPeriodLabel({ document }: { document: DealDocument }) {
  let period = '';
  if (document.documentType === 'RRF') {
    if (document.asOnDate) {
      const asOnDate = DateTime.fromISO(document.asOnDate).toLocaleString(DateTime.DATE_MED);
      period = `As On Date: ${asOnDate}`;
    } else {
      period = 'As On Date:';
    }
  }
  if (document.documentType === 'CF') {
    if (document.periodFrom) {
      const periodFrom = DateTime.fromISO(document.periodFrom).toFormat('LLL yyyy');
      const periodTo = DateTime.fromISO(document.periodTo).toFormat('LLL yyyy');
      period = `Period: ${periodFrom} - ${periodTo}`;
    } else {
      period = 'Period:';
    }
  }

  return (
    <Text fontSize="xs" color="primary.500" mt={1}>{period}</Text>
  );
}
