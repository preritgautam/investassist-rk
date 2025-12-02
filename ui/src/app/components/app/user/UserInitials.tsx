import React from 'react';
import { Avatar, AvatarProps, useStyleConfig } from '@chakra-ui/react';

export interface UserInitialsProps extends AvatarProps {
}

export function UserInitials(props: UserInitialsProps) {
  const styles = useStyleConfig('UserInitials', props);
  return <Avatar sx={styles} {...props}/>;
}
