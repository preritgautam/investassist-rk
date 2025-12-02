import React, { memo } from 'react';
import { Box, Button, useStyleConfig, BoxProps, Flex } from '@chakra-ui/react';
import { FlexCol } from '../FlexCol';
import { LinkButton } from '../../core/LinkButton';
import { NavigationChildItemProps, NavigationItem } from './SidebarNavigationItem';


function RootNavigationItem({ item, level }: NavigationChildItemProps) {
  const styles = useStyleConfig('NavigationChildItem');

  return item.href ? (
    <LinkButton
      leftIcon={item?.icon}
      size="sm" href={item.href ?? ''} pl={4}
      underline={false} w="100%" justifyContent="start"
      sx={styles} fontWeight={500}
    />
  ) : (
    <Button
      leftIcon={item?.icon}
      size="sm" pl={4} w="100%" justifyContent="start"
      sx={styles} fontWeight={500} variant="link"
    />
  );
}

export interface SidebarNavigationItemCollapsedProps extends BoxProps {
  item: NavigationItem,
  level: number,
  showSubmenu: boolean
}

export function SidebarNavigationItemCollapsed(
  { item, level, showSubmenu, ...rest }: SidebarNavigationItemCollapsedProps,
) {
  const styles = useStyleConfig('NavigationChildItem');
  const subMenuStyles = useStyleConfig('SideBar');

  if (item.hidden) {
    return null;
  }

  return (
    <Flex overflow="visible" {...rest}>
      <Box w={12} flexShrink={0}>
        <RootNavigationItem item={item} level={level}/>
      </Box>
      {showSubmenu && (
        <FlexCol position="absolute" left={12} zIndex={9} __css={subMenuStyles}>
          {item.href && (
            <LinkButton
              size="sm" href={item.href} pl={2} pr={4}
              underline={false} w="100%" justifyContent="start"
              sx={styles} fontWeight={500}
            >{item.label}</LinkButton>
          )}
          {!item.href && (
            <>
              <Button
                size="sm" pl={2} pr={4}
                w="100%" justifyContent="start"
                sx={styles} fontWeight={500} py={1}
                variant="link"
              >
                {item.label}
              </Button>
              {item.children.map((childItem) => (
                <LinkButton
                  leftIcon={childItem?.icon}
                  key={childItem.key}
                  size="sm" href={childItem.href} pl={2} pr={4}
                  underline={false} w="100%" justifyContent="start"
                  sx={styles} fontWeight={500} py={1}
                >{childItem.label}</LinkButton>
              ))}
            </>
          )}
        </FlexCol>
      )}
    </Flex>
  );
}

export const SidebarNavigationItemCollapsedMemo = memo(SidebarNavigationItemCollapsed);
