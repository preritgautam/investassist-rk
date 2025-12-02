import React, { ReactElement } from 'react';
import {
  Button,
  Flex, FormControl, Input,
  Popover, PopoverArrow, PopoverBody, PopoverCloseButton, PopoverContent, PopoverFooter, PopoverHeader,
  PopoverProps, PopoverTrigger,
} from '@chakra-ui/react';
import { useIsVisible } from '../../../hooks/utils/useIsVisible';
import { BodyS, HeadingXS } from '../typography';
import { useFieldValue } from '../../../hooks/utils/useFieldValue';

export interface ConfirmTextPopoverProps extends PopoverProps {
  renderTrigger: (show: () => void) => ReactElement,
  title: string,
  content: ReactElement,
  cancelText?: string,
  okText?: string,
  onConfirm: () => void,
  onCancel?: () => void,
  confirmString: string,
  confirmTextLabel?: string,
}

export function ConfirmTextPopover(
  {
    title, renderTrigger, content, cancelText = 'Cancel', confirmString, confirmTextLabel,
    okText = 'OK', onConfirm, onCancel, colorScheme, ...rest
  }: ConfirmTextPopoverProps) {
  const [visible, show, hide] = useIsVisible(false);

  const [value, setValue] = useFieldValue();

  function handleCancel() {
    hide();
    onCancel?.();
    setValue('');
  }

  function handleConfirm() {
    hide();
    onConfirm();
    setValue('');
  }

  return (
    <Popover isOpen={visible} onClose={handleCancel} closeOnBlur={false} {...rest}>
      <PopoverTrigger>
        {renderTrigger(show)}
      </PopoverTrigger>
      <PopoverContent>
        <PopoverArrow/>
        <PopoverCloseButton/>
        <PopoverHeader>
          <HeadingXS>{title}</HeadingXS>
        </PopoverHeader>
        <PopoverBody>
          {content}
          <FormControl mt={4}>
            <BodyS>{confirmTextLabel ?? `Enter "${confirmString}" in the following text box to continue`}</BodyS>
            <Input value={value} onChange={setValue} mt={2}/>
          </FormControl>
        </PopoverBody>
        <PopoverFooter>
          <Flex justify="space-between">
            <Button size="sm" colorScheme="gray" onClick={handleCancel}>{cancelText}</Button>
            <Button size="sm" colorScheme={colorScheme} onClick={handleConfirm} disabled={value !== confirmString}>
              {okText}
            </Button>
          </Flex>
        </PopoverFooter>
      </PopoverContent>
    </Popover>
  );
}
