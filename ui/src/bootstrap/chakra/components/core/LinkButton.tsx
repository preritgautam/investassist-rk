import React, { HTMLAttributeAnchorTarget } from 'react';
import { Button, ButtonProps, IconButton, IconButtonProps } from '@chakra-ui/react';
import { Anchor, AnchorProps } from './Anchor';

export interface LinkButtonProps extends ButtonProps {
  href: string,
  showUrlAs?: string,
  target?: HTMLAttributeAnchorTarget,
  rel?: HTMLAnchorElement['rel'],
  underline?: boolean,
  anchorProps?: AnchorProps,
}

export function LinkButton(
  {
    href,
    showUrlAs,
    target,
    rel,
    variant = 'link',
    underline = true,
    anchorProps = {},
    ...rest
  }: LinkButtonProps,
) {
  return (
    <Anchor
      href={href} showUrlAs={showUrlAs} target={target} rel={rel}
      {...anchorProps}
      sx={{
        _hover: {
          textDecoration: (variant === 'link') && underline ? 'underline' : 'none',
        },
      }}
    >
      <Button variant={variant} sx={{
        _hover: {
          textDecoration: (variant === 'link') && underline ? 'underline' : 'none',
        },
      }} {...rest} />
    </Anchor>
  );
}


export interface LinkIconButtonProps extends IconButtonProps {
  href: string,
  showUrlAs?: string,
  target?: HTMLAttributeAnchorTarget,
  rel?: HTMLAnchorElement['rel'],
}

export function LinkIconButton(
  {
    href,
    showUrlAs,
    target,
    rel,
    ...rest
  }: LinkIconButtonProps,
) {
  return (
    <Anchor
      href={href} showUrlAs={showUrlAs} target={target} rel={rel}
      sx={{
        _hover: {
          textDecoration: 'none',
        },
      }}
    >
      <IconButton sx={{
        _hover: {
          textDecoration: 'none',
        },
      }} {...rest} />
    </Anchor>
  );
}
