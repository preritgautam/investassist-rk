import { useCopyToClipboard } from '../../../../../bootstrap/hooks/utils/useCopyToClipboard';
import React, { useCallback, useEffect, useState } from 'react';
import { Button, Icon } from '@chakra-ui/react';
import { TickIcon } from '../../icons';

interface CopyDealIdButtonProps {
  dealSlug: string;
}

export function CopyDealIdButton({ dealSlug }: CopyDealIdButtonProps) {
  const { copyText } = useCopyToClipboard();
  const [copied, setCopied] = useState(false);

  const copySlug = useCallback(() => {
    copyText(dealSlug);
    setCopied(true);
  }, [copyText, dealSlug]);

  useEffect(() => {
    let timerId;
    if (copied) {
      timerId = setTimeout(() => setCopied(false), 1000);
    }
    return () => {
      clearTimeout(timerId);
    };
  }, [copied]);

  return (
    <Button
      size="xs" variant="secondary" colorScheme="secondary" m={4} onClick={copySlug}
      rightIcon={copied ? <Icon as={TickIcon}/> : null}
    >
      {copied ? 'Copied' : 'Copy Deal ID'}
    </Button>
  );
}
