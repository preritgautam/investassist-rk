const secondaryVariant = (props) => {
  const { colorScheme: c } = props;
  return {
    bg: `${c}.50`,
    color: `${c}.500`,
    _hover: {
      bg: `${c}.100`,
      color: `${c}.600`,
    },
    _active: {
      bg: `${c}.200`,
      color: `${c}.700`,
    },
  };
};

export const CloseButton = {
  variants: {
    secondary: secondaryVariant,
  },
};
