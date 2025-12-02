import { useToast, UseToastOptions } from '@chakra-ui/react';

export function useSuccessToast(options?: UseToastOptions) {
  return useToast({
    status: 'success',
    duration: 3000,
    isClosable: true,
    position: 'top',
    ...options,
  });
}
