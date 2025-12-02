/* eslint-disable react-hooks/rules-of-hooks */
import { Service } from '../../../../bootstrap/service/Service';
import { Assumption } from '../../../../types';
import {
  addAssumptionApi, addCompanyAssumptionApi,
  deleteUserAssumptionApi, getAccountAssumptionApi,
  getAccountAssumptionsApi, getUserAssumptionApi,
  getUserAssumptionsApi, updateUserAssumptionApi,
} from '../../../api/accountUser';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import Error from 'next/error';

export class AssumptionService extends Service {
  useAddAssumption() {
    const client = useQueryClient();
    return useMutation<Assumption, Error, Assumption>(
      async (params: Assumption) => {
        const { data: { assumption } } = await addAssumptionApi({ data: { assumption: params } });
        return assumption;
      },
      {
        onSuccess: () => client.invalidateQueries('user-assumptions'),
      },
    );
  }

  useAddAccountAssumption() {
    const client = useQueryClient();
    return useMutation<Assumption, Error, Assumption>(
      async (params: Assumption) => {
        const { data: { assumption } } = await addCompanyAssumptionApi({ data: { assumption: params } });
        return assumption;
      },
      {
        onSuccess: () => client.invalidateQueries('account-assumptions'),
      },
    );
  }

  useUserAssumptions() {
    return useQuery<Assumption[], Error>('user-assumptions', async () => {
      const { data: { assumptions } } = await getUserAssumptionsApi();
      return assumptions;
    });
  }

  useUserAssumption(assumptionId) {
    return useQuery<Assumption, Error>(['user-assumption', assumptionId], async () => {
      const { data: { assumption } } = await getUserAssumptionApi({ urlParams: assumptionId });
      return assumption;
    });
  }

  useAccountAssumption(assumptionId) {
    return useQuery<Assumption, Error>(['account-assumption', assumptionId], async () => {
      const { data: { assumption } } = await getAccountAssumptionApi({ urlParams: assumptionId });
      return assumption;
    });
  }

  useAccountAssumptions() {
    return useQuery<Assumption[], Error>(
      'account-assumptions', async () => {
        const { data: { assumptions } } = await getAccountAssumptionsApi();
        return assumptions;
      },
    );
  }

  useDeleteAssumption() {
    const client = useQueryClient();
    return useMutation<void, Error, string>(
      async (assumptionId: string) => {
        await deleteUserAssumptionApi({ urlParams: assumptionId });
      },
      {
        onSuccess: async () => {
          await client.invalidateQueries('user-assumptions');
          await client.invalidateQueries('account-assumptions');
        },
      },
    );
  }

  useUpdateAssumption() {
    const client = useQueryClient();
    return useMutation<Assumption, Error, Assumption>(
      async (assumption: Assumption) => {
        const { data: { assumption: _assumption } } = await updateUserAssumptionApi({
          urlParams: assumption.id,
          data: { assumption },
        });
        return _assumption;
      },
      {
        onSuccess: async (data) => {
          await client.invalidateQueries('user-assumptions');
          await client.invalidateQueries(['user-assumption', data.id]);
        },
      },
    );
  }
}

export const useAssumptionService: () => AssumptionService = () => AssumptionService.useService();
