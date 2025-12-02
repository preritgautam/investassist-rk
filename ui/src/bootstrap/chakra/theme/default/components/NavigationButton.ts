import { SystemStyleFunction } from '@chakra-ui/theme-tools';

const variantInactive: SystemStyleFunction = (props) => {
  const { colorScheme: c } = props;

  return {
    icon: {
      color: `${c}.500`,
    },
    label: {
      color: `${c}.500`,
    },
  };
};

const variantActive: SystemStyleFunction = (props) => {
  const { colorScheme: c } = props;

  return {
    button: {
      bg: `${c}.50`,
      borderLeft: '6px solid',
      borderColor: `${c}.500`,
    },
    icon: {
      color: `${c}.500`,
    },
    label: {
      color: `${c}.500`,
      fontWeight: 'bold',
    },
  };
};

export const NavigationButton = {
  parts: ['button', 'icon', 'label'],
  baseStyle: {
    button: {
      p: 4,
      px: 2,
      _focus: {
        outline: 'none !important',
        boxShadow: 'none !important',
      },
      _hover: {
        textDecoration: 'none',
      },
    },
    icon: {
      rounded: 'md',
      fontSize: 40,
      padding: 2,
      mb: 1,
    },
    label: {
      textAlign: 'center',
    },
  },
  variants: {
    inactive: variantInactive,
    active: variantActive,
  },
};

