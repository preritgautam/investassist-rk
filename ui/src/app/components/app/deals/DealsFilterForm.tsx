import React, { ReactElement, useCallback, useRef, useState } from 'react';
import { AccountUser, DealsFilterValues } from '../../../../types';
import { chakra, CloseButton, Flex, FlexProps, FormControl, FormLabel, HStack, Input, Select } from '@chakra-ui/react';
import { useIsVisible } from '../../../../bootstrap/hooks/utils/useIsVisible';
import { useAccountService } from '../../../services/account/user/AccountService';
import { DealStatusEnum } from '../../../enums/DealStatusEnum';


export interface DealsFilterFormProps extends Omit<FlexProps, 'onChange'> {
  isOpen: boolean,
  onClose: () => void,
  users: AccountUser[],
  onChange: (values: DealsFilterValues) => void,
}

export function DealsFilterForm({ isOpen, users, onChange, onClose, ...rest }: DealsFilterFormProps) {
  const nameRef = useRef<HTMLInputElement>();
  const addressRef = useRef<HTMLInputElement>();
  const statusRef = useRef<HTMLSelectElement>();
  const assignedRef = useRef<HTMLSelectElement>();

  const handleAnyChange = useCallback(() => {
    // something changed, just trigger callback for the change
    // Note: All values here are scalars, hence the pattern works.
    onChange({
      name: nameRef.current.value.toLowerCase(),
      address: addressRef.current.value.toLowerCase(),
      status: statusRef.current.value,
      assignedTo: assignedRef.current.value,
    });
  }, [onChange]);

  if (!isOpen) {
    return null;
  }

  return (
    <Flex
      rounded="sm" p={4} border="1px" justify="space-between"
      bg="secondarySections.500" borderColor="secondarySections.700" {...rest}
    >
      <chakra.form flexGrow={0.8}>
        <HStack>
          <FormControl flexGrow={1} w="auto">
            <FormLabel htmlFor="name">Name</FormLabel>
            <Input id="name" ref={nameRef} onChange={handleAnyChange} borderColor="secondarySections.700" bg="white"/>
          </FormControl>

          <FormControl flexGrow={2} w="auto">
            <FormLabel htmlFor="address">Address</FormLabel>
            <Input
              id="address" ref={addressRef} onChange={handleAnyChange} borderColor="secondarySections.700" bg="white"
            />
          </FormControl>

          <FormControl flexGrow={0.5} w="auto">
            <FormLabel htmlFor="status">Status</FormLabel>
            <Select
              id="status" ref={statusRef} onChange={handleAnyChange} borderColor="secondarySections.700" bg="white"
            >
              <option value="">All</option>
              <option>{DealStatusEnum.NEW.key}</option>
              <option>{DealStatusEnum.IN_PROGRESS.key}</option>
              <option>{DealStatusEnum.COMPLETED.key}</option>
            </Select>
          </FormControl>
          <FormControl flexGrow={0.5} w="auto">
            <FormLabel htmlFor="assignedTo">Assigned To</FormLabel>
            <Select
              id="assignedTo" ref={assignedRef} onChange={handleAnyChange} borderColor="secondarySections.700"
              bg="white"
            >
              <option value="">Any One</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>{user.name}</option>
              ))}
            </Select>
          </FormControl>
        </HStack>
      </chakra.form>
      <CloseButton onClick={onClose}/>
    </Flex>
  );
}

export type UseDealsFilterFormReturn = [ReactElement<DealsFilterFormProps>, DealsFilterValues, () => void, () => void]

export function useDealsFilterForm(): UseDealsFilterFormReturn {
  const [dealsFilters, setDealsFilters] = useState<DealsFilterValues>({
    name: '', address: '', status: '', assignedTo: '',
  });

  const clearFilters = useCallback(() => {
    setDealsFilters({
      name: '', address: '', status: '', assignedTo: '',
    });
  }, []);

  const [isOpen, , hide, , toggle] = useIsVisible(false);

  const handleHide = useCallback(() => {
    clearFilters();
    hide();
  }, [hide, clearFilters]);

  const handleToggle = useCallback(() => {
    clearFilters();
    toggle();
  }, [toggle, clearFilters]);

  const accountUsersQuery = useAccountService().useQueries().useAccountUsers();
  const accountUsers = accountUsersQuery.data ?? [];

  const form = <DealsFilterForm isOpen={isOpen} onClose={handleHide} users={accountUsers} onChange={setDealsFilters}/>;
  return [form, dealsFilters, handleToggle, handleHide];
}
