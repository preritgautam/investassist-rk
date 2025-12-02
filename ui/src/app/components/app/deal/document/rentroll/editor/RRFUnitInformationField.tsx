import { Select, SelectProps } from '@chakra-ui/react';
import { RRUnitInformationField } from '../../../../../../enums/RentRollFieldEnum';
import React from 'react';

interface RRFUnitInformationFieldProps extends SelectProps {
}

export function RRFUnitInformationField({ ...rest }: RRFUnitInformationFieldProps) {
  return (
    <Select size="xs" {...rest}>
      <option value="">-Select-</option>
      {RRUnitInformationField.all().map((f: RRUnitInformationField) => (
        <option key={f.key} value={f.key}>{f.label}</option>
      ))}
    </Select>
  );
}
