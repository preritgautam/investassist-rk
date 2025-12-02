import { Select, SelectProps } from '@chakra-ui/react';
import { RRAdditionalField } from '../../../../../../enums/RentRollFieldEnum';
import React from 'react';

interface RRFAdditionalDetailsFieldProps extends SelectProps {
}

export function RRFAdditionalDetailsField({ ...rest }: RRFAdditionalDetailsFieldProps) {
  return (
    <Select size="xs" {...rest}>
      <option value="">-Select-</option>
      {RRAdditionalField
        .all()
        .filter((f: RRAdditionalField) => !f.options.hidden)
        .map((f: RRAdditionalField) => (
          <option key={f.key} value={f.key}>{f.label}</option>
        ))}
    </Select>
  );
}
