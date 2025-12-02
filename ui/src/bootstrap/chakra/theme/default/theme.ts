import { extendTheme, withDefaultColorScheme, withDefaultSize } from '@chakra-ui/react';
import { themeColors } from './colors';
import { UserInitials } from './components/UserInitials';
import { Sidebar } from './components/Sidebar';
import { NavigationButton } from './components/NavigationButton';
import { Button } from './components/Button';
import { CloseButton } from './components/CloseButton';
import { Modal } from './components/Modal';

// Components default theme path
// ui/node_modules/@chakra-ui/theme/src/components

export const theme = extendTheme(
  withDefaultColorScheme({
    colorScheme: 'primary',
  }),
  withDefaultSize({ size: 'sm' }),
  {
    fonts: {
      body: 'Roboto',
      heading: 'Roboto',
    },
    styles: {
      global: {
        '*': {
          transition: '0.0s',
          borderColor: 'border.500',
        },

        'button': {
          _focus: {
            outline: 'none !important',
            boxShadow: 'none !important',
          },
        },
      },
    },
  },
  {
    colors: themeColors,
    shadows: {
      _md: '0px 0px 30px rgba(0, 0, 0, 0.06)',
      _sm: '0px 0px 20px rgba(0, 0, 0, 0.06)',
    },
    components: {
      // Specific Components
      Modal: Modal,
      UserInitials: UserInitials,
      Sidebar: Sidebar,
      NavigationButton: NavigationButton,
      Button: Button,
      CloseButton: CloseButton,

      Card: {
        baseStyle: {
          d: 'flex',
          bg: '#fff',
          p: 4,
          // boxShadow: '0 0 6px -1px rgba(0, 0, 0, 0.1),0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          boxShadow: '_sm',
        },
      },

      NavigationChildItem: {
        baseStyle: {
          color: '#222',
          my: 2,
          py: 2,
          _hover: {
            color: '#555',
          },
        },
      },
      NavigationParentItem: {
        baseStyle: {
          color: '#222',
          my: 2,
          py: 2,
          _hover: {
            color: '#444',
          },
          _active: {
            color: '#333',
          },
        },
      },

      Popover: {
        baseStyle: {
          content: {
            _focus: {
              outline: 'none !important',
              boxShadow: 'none !important',
            },
          },
        },
      },

      Input: {
        baseStyle: {
          field: {
            _readOnly: {
              color: 'gray.400',
            },
          },
        },
      },
      FormLabel: {
        baseStyle: {
          fontSize: 'xs',
        },
      },
      Paper: {
        baseStyle: {
          border: 'none',
          _hover: {
            boxShadow: 'sm',
          },
          minH: 0,
          overflow: 'auto',
        },

        variants: {
          hoverable: {
            border: '1px',
            borderColor: 'gray.300',
            rounded: 'md',
            transition: '0.2s',
            _hover: {
              // boxShadow: 'xl',
              boxShadow: 'rgba(0, 0, 0, 0.1) 0px 0px 15px 2px',
            },
          },

          hoverableRect: {
            border: '1px',
            borderColor: 'gray.300',
            rounded: 0,
            transition: '0.2s',
            _hover: {
              boxShadow: 'xl',
            },
          },
        },
      },
    },
  },
);


