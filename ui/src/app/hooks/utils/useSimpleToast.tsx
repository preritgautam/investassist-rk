import { useToast, UseToastOptions } from '@chakra-ui/react';
import { BodyXS, HeadingXS } from '../../../bootstrap/chakra/components/typography';
import React from 'react';

export interface SimpleToastOptions extends UseToastOptions {
  title: string,
  description: string,
}

export function useSimpleToast() {
  const toast = useToast();
  return function(options: SimpleToastOptions) {
    const { title, description, duration, ...rest } = options;
    toast({
      title: <HeadingXS>{title}</HeadingXS>,
      description: <BodyXS>{description}</BodyXS>,
      duration: duration ?? 3000,
      position: 'top',
      containerStyle: {
        borderRadius: 'xs',
      },
      ...rest,
    });
  };
}
