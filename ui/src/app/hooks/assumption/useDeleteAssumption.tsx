import { Assumption } from '../../../types';
import { useAssumptionService } from '../../services/account/user/AssumptionService';
import { useSimpleToast } from '../utils/useSimpleToast';
import { useCallback } from 'react';

export interface UseDeleteAssumptionProps {
  assumption: Assumption;
}

export function useDeleteAssumption({ assumption }: UseDeleteAssumptionProps): () => Promise<void> {
  const deleteAssumptionMutation = useAssumptionService().useDeleteAssumption();
  const toast = useSimpleToast();
  const handleDelete = useCallback(async () => {
    await deleteAssumptionMutation.mutateAsync(assumption.id, {
      onSuccess() {
        toast({
          title: 'Success!',
          description: `Assumption was successfully deleted.`,
        });
      },
    });
  }, [deleteAssumptionMutation, assumption.id, toast]);
  return handleDelete;
}
