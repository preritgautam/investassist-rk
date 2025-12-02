import React, { ReactElement } from 'react';
import { Box, Button, Collapse, useStyleConfig, BoxProps } from '@chakra-ui/react';
import { useToggle } from '../../../../hooks/utils/useToggle';
import { CollapseIcon, ExpandIcon } from '../../icons';
import { FlexCol } from '../FlexCol';
import { LinkButton } from '../../core/LinkButton';

export interface NavigationItem {
  key: string,
  target?: string,
  href?: string,
  icon?: ReactElement,
  as?: string,
  label: string,
  children?: NavigationItem[],
  hidden?: boolean,
}

export interface NavigationChildItemProps {
  item: NavigationItem,
  level: number,
}

function NavigationChildItem({ item, level }: NavigationChildItemProps) {
  const styles = useStyleConfig('NavigationChildItem');

  return (
    <LinkButton
      leftIcon={item?.icon}
      size="sm" href={item.href} pl={level * 4}
      underline={false} w="100%" justifyContent="start"
      sx={styles} fontWeight={500}
    >
      {item.label}
    </LinkButton>
  );
}

export interface NavigationParentItemProps {
  level: number,
  item: NavigationItem,
}

function NavigationParentItem({ level, item }: NavigationParentItemProps) {
  const [expanded, toggleExpanded] = useToggle(false);
  const styles = useStyleConfig('NavigationParentItem');

  return (
    <FlexCol overflow="hidden">
      <Button
        pl={level * 4}
        size="sm"
        variant="link"
        onClick={toggleExpanded}
        justifyContent="start"
        leftIcon={item?.icon}
        sx={styles}
        fontWeight={500}
      >
        {item.label} {expanded ? <CollapseIcon ml={1} mt={1}/> : <ExpandIcon ml={1} mt="2px"/>}
      </Button>
      <Collapse in={expanded} animateOpacity>
        <Box>
          {item.children.map((childItem) => (
            <SidebarNavigationItem key={childItem.key} item={childItem} level={level + 1} mt={-2}/>
          ))}
        </Box>
      </Collapse>
    </FlexCol>
  );
}

export interface SidebarNavigationItemProps extends BoxProps {
  item: NavigationItem,
  level: number,
}

export function SidebarNavigationItem({ item, level, ...rest }: SidebarNavigationItemProps) {
  if (item.hidden) {
    return null;
  }

  if (item.href) {
    return (
      <Box {...rest}>
        <NavigationChildItem item={item} level={level}/>
      </Box>
    );
  }

  return (
    <Box {...rest}>
      <NavigationParentItem item={item} level={level}/>
    </Box>
  );
}
