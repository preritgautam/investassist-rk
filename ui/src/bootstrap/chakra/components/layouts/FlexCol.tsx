import React, { ForwardedRef, forwardRef } from 'react';
import { Flex, FlexProps } from '@chakra-ui/react';

export interface FlexColProps extends FlexProps {
  noScroll?: boolean,
}

export const FlexCol = forwardRef(function FlexCol(props: FlexColProps, ref: ForwardedRef<HTMLDivElement>) {
  const { noScroll, ...rest } = props;
  const scrollProps = noScroll ? {} : { minH: 0, overflow: 'auto' };

  return <Flex direction="column" {...scrollProps} {...rest} ref={ref}/>;
});
