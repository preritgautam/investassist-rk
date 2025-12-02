import { Assumption } from '../../../../../types';
import { useAssumptionService } from '../../../../services/account/user/AssumptionService';
import { noopArray } from '../../../../../bootstrap/utils/noop';
import React, { ReactElement, useCallback, useRef } from 'react';
import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  Text,
} from '@chakra-ui/react';
import { useIsVisible } from '../../../../../bootstrap/hooks/utils/useIsVisible';

interface CopyFromAssumptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSourceAssumptionSelect: (a: Assumption) => void;
}

function CopyFromAssumptionsModal({ isOpen, onClose, onSourceAssumptionSelect }: CopyFromAssumptionsModalProps) {
  const assumptionService = useAssumptionService();
  const userAssumptions = assumptionService.useUserAssumptions().data ?? noopArray;
  const accountAssumptions = assumptionService.useAccountAssumptions().data ?? noopArray;
  const selectRef = useRef<HTMLSelectElement>(null);

  const onConfirm = useCallback(() => {
    const assumptionId = selectRef.current.value;
    const assumption = [...userAssumptions, ...accountAssumptions].find((a) => a.id === assumptionId);
    onSourceAssumptionSelect(assumption);
    onClose();
  }, [userAssumptions, accountAssumptions, onSourceAssumptionSelect, onClose]);

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay/>
      <ModalContent>
        <ModalHeader>Copy From Assumptions</ModalHeader>
        <ModalCloseButton/>
        <ModalBody>
          <Text fontSize="sm" mb={4}>Select Assumptions set to copy values from</Text>
          <Select ref={selectRef}>
            {userAssumptions.length && (
              <optgroup label="Your Assumptions">
                {userAssumptions.map((a) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </optgroup>
            )}
            {accountAssumptions.length && (
              <optgroup label="Company Assumptions">
                {accountAssumptions.map((a) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </optgroup>
            )}
          </Select>
        </ModalBody>

        <ModalFooter>
          <Button mr={3} onClick={onClose} variant="outline">Cancel</Button>
          <Button onClick={onConfirm}>Copy Values</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

interface UseCopyFromAssumptionsModalProps {
  onSourceAssumptionSelect: (a: Assumption) => void;
}

type UseCopyFromAssumptionsModalReturn = [ReactElement<CopyFromAssumptionsModalProps>, () => void, () => void];

export function useCopyFromAssumptionsModal(
  { onSourceAssumptionSelect }: UseCopyFromAssumptionsModalProps,
): UseCopyFromAssumptionsModalReturn {
  const [isOpen, show, hide] = useIsVisible(false);
  const modal = (
    <CopyFromAssumptionsModal isOpen={isOpen} onClose={hide} onSourceAssumptionSelect={onSourceAssumptionSelect}/>
  );
  return [modal, show, hide];
}
