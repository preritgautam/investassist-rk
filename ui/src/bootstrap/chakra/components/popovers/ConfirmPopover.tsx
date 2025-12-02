import React, { ReactElement } from 'react';
import {
  Button,
  Flex,
  Popover, PopoverArrow, PopoverBody, PopoverCloseButton, PopoverContent, PopoverFooter, PopoverHeader,
  PopoverProps, PopoverTrigger,
} from '@chakra-ui/react';
import { useIsVisible } from '../../../hooks/utils/useIsVisible';
import { HeadingXS } from '../typography';

export interface ConfirmPopoverProps extends PopoverProps {
  renderTrigger: (show: () => void) => ReactElement,
  title: string,
  content: ReactElement,
  cancelText?: string,
  okText?: string,
  onConfirm: () => void,
  onCancel?: () => void,
}

export function ConfirmPopover(
  {
    title, renderTrigger, content, cancelText = 'Cancel',
    okText = 'OK', onConfirm, onCancel, colorScheme, ...rest
  }: ConfirmPopoverProps) {
  const [visible, show, hide] = useIsVisible(false);

  function handleCancel() {
    hide();
    onCancel?.();
  }

  function handleConfirm() {
    hide();
    onConfirm();
  }

  return (
    <Popover isOpen={visible} onClose={hide} closeOnBlur={false} {...rest}>
      <PopoverTrigger>
        {renderTrigger(show)}
      </PopoverTrigger>
      <PopoverContent>
        <PopoverArrow/>
        <PopoverCloseButton/>
        <PopoverHeader>
          <HeadingXS>{title}</HeadingXS>
        </PopoverHeader>
        <PopoverBody>{content}</PopoverBody>
        <PopoverFooter>
          <Flex justify="space-between">
            <Button size="sm" colorScheme="gray" onClick={handleCancel}>{cancelText}</Button>
            <Button size="sm" colorScheme={colorScheme} onClick={handleConfirm}>{okText}</Button>
          </Flex>
        </PopoverFooter>
      </PopoverContent>
    </Popover>
  );
}
