import React, { useCallback, useState } from 'react';
import { NavigationItem, SidebarNavigationItem } from './SidebarNavigationItem';
import { FlexCol, FlexColProps } from '../FlexCol';
import { SidebarNavigationItemCollapsedMemo } from './SidebarNavigationItemCollapsed';
import { Flex } from '@chakra-ui/react';

export interface SidebarNavigationProps extends FlexColProps {
  items: NavigationItem[],
  collapsed?: boolean,
}

function SidebarNavigationExpanded({ items, collapsed, ...rest }: SidebarNavigationProps) {
  return (
    <>
      <FlexCol align="stretch" {...rest}>
        {items.map((item) => (
          <SidebarNavigationItem key={item.key} item={item} level={1}/>
        ))}
      </FlexCol>
    </>
  );
}

function SidebarNavigationCollapsed({ items, collapsed, ...rest }: SidebarNavigationProps) {
  const [submenuItem, setSubmenuItem] = useState<NavigationItem>();

  const onHoverStart = useCallback((item: NavigationItem) => {
    setSubmenuItem(item);
  }, []);

  const onHoverEnd = useCallback(() => {
    setSubmenuItem(null);
  }, []);

  return (
    <Flex>
      <FlexCol align="stretch" {...rest}>
        {items.map((item) => (
          <SidebarNavigationItemCollapsedMemo
            key={item.key} item={item} level={1}
            onMouseEnter={() => onHoverStart(item)} onMouseLeave={onHoverEnd}
            showSubmenu={item === submenuItem}
          />
        ))}
      </FlexCol>
    </Flex>
  );
}


export function SidebarNavigation({ items, collapsed, ...rest }: SidebarNavigationProps) {
  if (!collapsed) {
    return <SidebarNavigationExpanded items={items} {...rest} />;
  }

  return <SidebarNavigationCollapsed items={items} {...rest} />;
}
