import { Button, ButtonProps, Icon, Menu, MenuButton, MenuItem, MenuList, MenuProps } from '@chakra-ui/react';
import React from 'react';
import { MenuDownIcon, TickIcon } from '../../../../app/components/app/icons';
import { identity } from '../../../utils/noop';

export interface CustomSelectProps extends Omit<MenuProps, 'children'> {
  name?: string;
  value: string;
  onChange: (value: any) => void;
  onBlur?: () => void;
  options: any[];
  optionValue: (option: any) => any;
  optionLabel: (option: any) => string;
  optionMenuLabel?: (option: any) => string;
  buttonProps?: ButtonProps;
}

export class CustomSelect extends React.Component<CustomSelectProps> {
  static defaultProps = {
    optionValue: identity,
    optionLabel: identity,
    buttonProps: {},
  };

  private valueToOption(value) {
    return this.props.options.find((o) => this.props.optionValue(o) === value);
  }

  render() {
    let {
      name,
      value,
      onChange,
      onBlur,
      options,
      optionValue,
      optionLabel,
      optionMenuLabel,
      buttonProps,
      ...rest
    } = this.props;
    optionMenuLabel = optionMenuLabel ?? optionLabel;

    const selectedOption = this.valueToOption(value);
    const label = selectedOption ? optionLabel(selectedOption) : '';

    return (
      <>
        <input type="hidden" name={name} value={value}/>
        <Menu {...rest}>
          <MenuButton as={Button} rightIcon={<Icon as={MenuDownIcon}/>} onBlur={onBlur} {...buttonProps}>
            {label}
          </MenuButton>
          <MenuList>
            {options.map((option) => {
              const oValue = optionValue(option);
              const menuLabel = optionMenuLabel(option);
              const selected = oValue === value;
              return (
                <MenuItem
                  key={oValue} onClick={() => onChange(oValue)} icon={selected ? <Icon as={TickIcon}/> : undefined}
                >{menuLabel}</MenuItem>
              );
            })}
          </MenuList>
        </Menu>
      </>
    );
  }
}

