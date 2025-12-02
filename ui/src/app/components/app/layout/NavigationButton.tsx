import { As, Icon, Text, useMultiStyleConfig } from '@chakra-ui/react';
import { FlexCol } from '../../../../bootstrap/chakra/components/layouts/FlexCol';
import React from 'react';
import { ThemeTypings } from '@chakra-ui/styled-system';
import { Anchor } from '../../../../bootstrap/chakra/components/core/Anchor';

interface NavigationButtonProps {
  label: string,
  href: string,
  icon: As,
  variant?: 'active' | 'inactive',
  colorScheme?: ThemeTypings['colorSchemes'] | (string & {})
}

export function NavigationButton(
  { href, label, icon, variant = 'inactive', colorScheme = 'primaryAlt' }: NavigationButtonProps,
) {
  const styles = useMultiStyleConfig('NavigationButton', { colorScheme, variant });
  return (
    <Anchor href={href} sx={styles.button}>
      <FlexCol align="center" w="100%">
        <Icon as={icon} __css={styles.icon}/>
        <Text fontSize="xs" sx={styles.label} noOfLines={2}>{label}</Text>
      </FlexCol>
    </Anchor>
  );

  // return (
  //   <LinkButton href={href} underline={false} __css={styles.button}>
  //     <FlexCol align="stretch" w="100%">
  //       <Icon as={icon} __css={styles.icon}/>
  //       <Text fontSize="xs" sx={styles.label}>{label}</Text>
  //     </FlexCol>
  //   </LinkButton>
  // );
}
