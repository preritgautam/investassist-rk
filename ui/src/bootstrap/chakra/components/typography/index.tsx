import React from 'react';
import { Heading, HeadingProps as _HeadingProps, Text, TextProps } from '@chakra-ui/react';

export interface HeadingProps extends _HeadingProps {
}

export interface BodyProps extends TextProps {
}


export function Heading4XL(props: HeadingProps) {
  return <Heading size="4xl" {...props} />;
}

export function Heading3XL(props: HeadingProps) {
  return <Heading size="3xl" {...props} />;
}

export function Heading2XL(props: HeadingProps) {
  return <Heading size="2xl" {...props} />;
}

export function HeadingXL(props: HeadingProps) {
  return <Heading size="xl" {...props} />;
}

export function HeadingL(props: HeadingProps) {
  return <Heading size="lg" {...props} />;
}

export function HeadingM(props: HeadingProps) {
  return <Heading size="md" {...props} />;
}

export function HeadingS(props: HeadingProps) {
  return <Heading size="sm" {...props} />;
}

export function HeadingXS(props: HeadingProps) {
  return <Heading size="xs" {...props} />;
}

export function BodyL(props: BodyProps) {
  return <Text fontSize="lg" {...props} />;
}

export function BodyM(props: BodyProps) {
  return <Text fontSize="md" {...props} />;
}

export function BodyS(props: BodyProps) {
  return <Text fontSize="sm" {...props} />;
}

export function BodyXS(props: BodyProps) {
  return <Text fontSize="xs" {...props} />;
}
