import React from 'react';
import { Text } from '@chakra-ui/react';

export interface TodoProps {
  children: string;
}

export function Todo({ children: todo }: TodoProps) {
  return (
    <Text fontSize="xs" p={1} bg="red.50">{todo}</Text>
  );
}
