import { DealStatus } from '../../../../types';
import { getDealStatusColor } from '../../../services/utils/utils';
import { Icon, IconProps } from '@chakra-ui/react';
import { DealStatusIcon } from '../icons';
import React from 'react';

export interface DealStatusBadgeProps extends IconProps {
  status: DealStatus;
  bordered?: boolean;
}

export function DealStatusBadge({ status, fontSize, bordered = true, ...rest }: DealStatusBadgeProps) {
  const color = getDealStatusColor(status);
  const borderStyle = bordered ? {
    roundedRight: 'md',
    borderLeft: '3px solid',
    borderColor: `${color}.500`,
  } : {
    rounded: 'md',
  };

  return (
    <Icon
      as={DealStatusIcon}
      bg={`${color}.50`} p={2} fontSize={fontSize ?? 40} color={`${color}.500`}
      {...borderStyle} {...rest}
    />
  );
}
