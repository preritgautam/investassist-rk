import React from 'react';
import { BodyS } from '../../typography';
import { CloseIcon } from '../../icons';
import { Box, Fade, Flex, IconButton } from '@chakra-ui/react';
import { Paper, PaperProps } from '../../containers/Paper';

export interface FormErrorsProps extends PaperProps {
  errors?: string[];
  onClose?: Function,
}

export function FormErrors({ errors, onClose, ...rest }: FormErrorsProps) {
  const open = !!errors?.length;

  return (
    <Fade in={open} unmountOnExit>
      <Paper p={2} pl={3} bg="danger.100" borderColor="danger.200" variant="hoverable" {...rest}>
        <Flex justify="space-between">
          <Flex direction="column" flexGrow={1}>
            {(errors ?? []).map((error) => (
              <BodyS key={error} m={0}>{error}</BodyS>
            ))}
          </Flex>
          {onClose && (
            <Box flexShrink={0} flexGrow={0} mt={-1} mr={-1} ml={1}>
              <IconButton
                aria-label="close errors" colorScheme="danger" variant="ghost" size="sm"
                onClick={() => onClose()} icon={<CloseIcon/>} h="1.5rem" w="1.5rem" minW="1.5rem"
              />
            </Box>
          )}
        </Flex>
      </Paper>
    </Fade>
  );
}
