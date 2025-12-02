import React, { ReactElement } from 'react';
import Link, { LinkProps } from 'next/link';
import {
  Flex,
  FlexProps,
  IconButton,
  Link as CLink,
  LinkProps as CLinkProps,
  Tooltip,
} from '@chakra-ui/react';
import { UrlObject } from 'url';
import { LinkIcon } from '../icons';
import { useCopyToClipboard } from '../../../hooks/utils/useCopyToClipboard';


export interface AnchorProps extends
  CLinkProps,
  Omit<LinkProps, 'as' | 'href' | 'passHref' | 'onClick' | 'onMouseEnter'> {
  showUrlAs?: string | UrlObject,
}

export function Anchor(props: AnchorProps) {
  const {
    href,
    replace,
    scroll,
    shallow,
    prefetch,
    locale,
    showUrlAs,
    ...rest
  } = props;

  return (
    <Link
      href={href} replace={replace} scroll={scroll} shallow={shallow}
      prefetch={prefetch} locale={locale} as={showUrlAs} passHref
    >
      <CLink {...rest} />
    </Link>
  );
}

export interface HeadAnchorProps extends FlexProps {
  id: string,
  children: ReactElement,
}

export function HeadAnchor({ id, children, ...rest }: HeadAnchorProps) {
  const { copyText } = useCopyToClipboard();
  const handleCopy = () => {
    const url = `${window.location.protocol}//${window.location.host}${window.location.pathname}#${id}`;
    copyText(url);
  };

  return (
    <Flex align="center" {...rest}>
      <Anchor href={`#${id}`}>
        <Tooltip label="Click to copy Url">
          <IconButton aria-label="copy-link" icon={<LinkIcon/>} size="xs" variant="ghost" onClick={handleCopy}/>
        </Tooltip>
      </Anchor>
      {React.cloneElement(children, { id })}
    </Flex>
  );
}


