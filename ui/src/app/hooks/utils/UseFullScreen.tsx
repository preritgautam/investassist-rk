import React, { useEffect, useState } from 'react';
import { useCallback } from 'react';
import { Icon, IconButton } from '@chakra-ui/react';
import { ExitFullScreenIcon, GoFullScreenIcon } from '../../components/app/icons';
import { Tooltip } from '../../components/core/Tooltip';

export function useFullScreen(): [() => Promise<void>, () => Promise<void>, boolean] {
  const [isFullScreen, setIsFullScreen] = useState(!!document.fullscreenElement);

  useEffect(() => {
    function handleFullScreenChange() {
      setIsFullScreen(!!document.fullscreenElement);
    }

    document.addEventListener('fullscreenchange', handleFullScreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullScreenChange);
    };
  }, []);

  const toggle = useCallback(async () => {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen();
    } else {
      await document?.exitFullscreen();
    }
  }, []);

  const exit = useCallback(async () => {
    if (document.fullscreenElement) {
      await document?.exitFullscreen();
    }
  }, []);

  return [toggle, exit, isFullScreen];
}

export function useFullScreenButton(): [JSX.Element, () => Promise<void>] {
  const [toggleFullScreen, exitFullScreen, isFullScreen] = useFullScreen();
  const button = (
    <Tooltip label={isFullScreen ? 'Exit Full Screen View' : 'Full Screen View'}>
      <IconButton
        aria-label={isFullScreen ? 'Exit full screen' : 'Go Full Screen'}
        onClick={toggleFullScreen}
        icon={<Icon as={isFullScreen ? ExitFullScreenIcon : GoFullScreenIcon} fontSize="lg"/>}
        size="xs"
        variant="secondary"
      />
    </Tooltip>
  );
  return [button, exitFullScreen];
}
