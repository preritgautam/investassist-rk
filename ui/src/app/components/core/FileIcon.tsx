import React from 'react';
import { ExcelIcon, PdfIcon } from '../app/icons';
import { Icon, IconProps } from '@chakra-ui/react';

export interface FileIconProps extends IconProps {
  fileName: string,
  faded?: boolean,
}

export function FileIcon({ fileName, faded = false, ...rest }: FileIconProps) {
  const lowerFileName = fileName.toLowerCase();
  const isPdf = lowerFileName.endsWith('.pdf');
  // const isXlsx = lowerFileName.endsWith('.xlsx');

  const data = isPdf ? {
    icon: PdfIcon,
    color: `red.${faded ? 200 : 500}`,
  } : {
    icon: ExcelIcon,
    color: `green.${faded ? 200 : 500}`,
  };

  return (
    <Icon as={data.icon} {...rest} color={data.color}/>
  );
}
