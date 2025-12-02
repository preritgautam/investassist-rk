import { Select, SelectProps } from '@chakra-ui/react';
import { RRLeaseTermsField } from '../../../../../../enums/RentRollFieldEnum';
import React from 'react';

interface RRFLeaseTermsFieldProps extends SelectProps {
}

export function RRFLeaseTermsField({ ...rest }: RRFLeaseTermsFieldProps) {
  return (
    <Select size="xs" {...rest}>
      <option value="">-Select-</option>
      {RRLeaseTermsField.all().map((f: RRLeaseTermsField) => (
        <option key={f.key} value={f.key}>{f.label}</option>
      ))}
    </Select>
  );
}
