/* eslint-disable react-hooks/rules-of-hooks */
import { Service } from '../../../../bootstrap/service/Service';
import {
  Assumption,
  Deal,
  DealDetails, DealMatch, DealModelHistory,
  DealStatus, LineItemsDictionary,
  OnlyUseQueryOptions, DealAddress,
} from '../../../../types';
import {
  addDealApi,
  getDealBySlugApi,
  getDealsApi,
  assignDealApi,
  updateDealApi,
  getDealAssumptionApi, updateDealAssumptionApi, getMatchingCFDealsApi, getDealDetailsApi, updateDealDetailsApi,
  getGooglePlacesSuggestionApi, getDetailsByPlaceId,
  deleteDealApi, getDealDictionaryApi, getDealModelHistoryApi, deleteDealModelHistoryApi, getDealApi,
} from '../../../api/accountUser';
import { useMutation, useQueries, useQuery, useQueryClient, UseQueryOptions } from 'react-query';
import { defaultAssumption } from '../../../components/app/forms/assumption/defaultAssumption';
import Error from 'next/error';

export interface AssignDealParams {
  dealId: string;
  assignedToUserId: string;
}

export interface UpdateDealParams {
  id: string,
  name?: string,
  address?: DealAddress,
  slug?: string,
  status?: DealStatus,
  details?: DealDetails,
  assumptions?: Assumption,
}

export interface UpdateDealDetailsParams {
  dealId: string;
  dealDetails: Partial<DealDetails>;
}

export class DealService extends Service {
  useDealAssumption(dealId: string, options?: OnlyUseQueryOptions<Assumption>) {
    return useQuery<Assumption, Error>(['deal-assumption', dealId], async () => {
      if (!dealId) {
        return defaultAssumption;
      }

      const { data: { assumption } } = await getDealAssumptionApi({ urlParams: dealId });
      return assumption ?? defaultAssumption;
    }, options);
  }

  useUpdateDealAssumption(dealId: string) {
    const client = useQueryClient();
    return useMutation<Assumption, Error, Assumption>(async (a: Assumption) => {
      const { data: { assumption } } = await updateDealAssumptionApi(
        { urlParams: dealId, data: { assumption: a } },
      );
      return assumption;
    }, {
      onSuccess: () => client.invalidateQueries(['deal-assumption', dealId]),
    });
  }

  useDealDetails(dealId: string) {
    return useQuery<DealDetails, Error>(['deal-details', dealId], () => this.getDealDetails(dealId), {
      refetchInterval: false,
      refetchOnWindowFocus: false,
      refetchIntervalInBackground: false,
      enabled: !!dealId,
    });
  }

  useMultipleDeals(dealSlugs: string[]) {
    return useQueries(
      dealSlugs.map((slug: string) => ({
        queryKey: ['account-user-deal', slug],
        queryFn: () => this.getDealBySlug(slug),
        refetchOnWindowFocus: false,
      })),
    );
  }

  useMultipleDealsById(dealIds: string[]) {
    return useQueries(
      dealIds.map((id: string) => ({
        queryKey: ['account-user-deal', id], queryFn: () => this.getDeal(id),
      })),
    );
  }

  useDealDictionary(dealId: string) {
    return useQuery<LineItemsDictionary, Error>(['deal-dictionary', dealId], () => this.getDealDictionary(dealId), {
      refetchInterval: false,
      refetchOnWindowFocus: false,
      refetchIntervalInBackground: false,
      enabled: !!dealId,
    });
  }

  useCFMatchingDeals(dealId: string) {
    return useQuery<DealMatch[], Error>(['cf-matching-deals', dealId], () => this.getMatchingCFDeals(dealId), {
      enabled: !!dealId,
    });
  }

  useDealModelHistory(dealId: string) {
    return useQuery<DealModelHistory[], Error>(['deal-model-history', dealId], () => this.getDealModelHistory(dealId), {
      enabled: !!dealId,
    });
  }

  useUpdateDealDetails() {
    const client = useQueryClient();
    return useMutation<void, Error, UpdateDealDetailsParams>(this.updateDealDetails, {
      onSuccess: (_, { dealId }) => client.invalidateQueries(['deal-details', dealId]),
    });
  }

  useDeleteDeal() {
    const client = useQueryClient();
    return useMutation<void, Error, string>(this.deleteDeal, {
      onSuccess: () => client.invalidateQueries(['account-user-deals']),
    });
  }

  useDeleteDealModelHistory() {
    const client = useQueryClient();
    return useMutation<void, Error, { dealId: string, modelHistoryId: string }, string>(this.deleteDealModelHistory, {
      onSuccess: (_, { dealId }) => client.invalidateQueries(['deal-model-history', dealId]),
    });
  }

  useQueries() {
    const client = useQueryClient();

    const useDeals = () => useQuery<Deal[], Error>('account-user-deals', this.getDeals);
    const useDealBySlug = (slug: string, options: UseQueryOptions<Deal> = {}) =>
      useQuery<Deal, Error>(['account-user-deal', slug], () => this.getDealBySlug(slug), {
        ...options,
        initialData: () => {
          return client.getQueryData<Deal[]>('account-user-deals')?.find((d: Deal) => d.slug === slug);
        },
      });

    const addDealQuery = useMutation<Deal, Error, Deal>(this.addDeal, {
      onSuccess: () => client.invalidateQueries('account-user-deals'),
    });

    const updateDealMutation = useMutation<Deal, Error, UpdateDealParams>(this.updateDeal, {
      onSuccess: async (deal) => {
        return await Promise.allSettled([
          client.invalidateQueries(['account-user-deals']),
          client.invalidateQueries(['account-user-deal', deal.slug]),
        ]);
      },
    });

    const assignDealMutation =
      useMutation<void, Error, AssignDealParams>(this.assignDeal, {
        onSuccess: () => client.invalidateQueries('account-user-deals'),
      });


    return {
      useDeals,
      useDealBySlug,
      addDealQuery,
      assignDealMutation,
      updateDealMutation,
    };
  }

  async getDealBySlug(slug: string): Promise<Deal> {
    if (!slug) {
      return null;
    }
    const { data: { deal } } = await getDealBySlugApi({ urlParams: slug });
    return deal as Deal;
  }

  async getDeals(): Promise<Deal[]> {
    const { data: { deals } } = await getDealsApi();
    return deals;
  }

  async getDeal(dealId: string): Promise<Deal> {
    const { data: { deal } } = await getDealApi({ urlParams: dealId });
    return deal;
  }

  async addDeal(propDetails: Deal): Promise<Deal> {
    const { data: { deal } } = await addDealApi({ data: { deal: propDetails } });
    return deal;
  }

  async updateDeal(params: UpdateDealParams): Promise<Deal> {
    const { data: { deal } } = await updateDealApi({ urlParams: params.id, data: { deal: params } });
    return deal;
  }

  async assignDeal({ dealId, assignedToUserId }: AssignDealParams): Promise<void> {
    await assignDealApi({ urlParams: { dealId }, data: { assignedToUserId } });
  }

  async getMatchingCFDeals(dealId: string): Promise<DealMatch[]> {
    const { data: { deals } }: { data: { deals: DealMatch[] } } = await getMatchingCFDealsApi({ urlParams: dealId });
    return deals.sort((d1, d2) => d2.matchPercent - d1.matchPercent);
  }

  async getDealDetails(dealId: string): Promise<DealDetails> {
    const { data: { dealDetails } } = await getDealDetailsApi({ urlParams: dealId });
    return dealDetails;
  }

  async getDealDictionary(dealId: string): Promise<LineItemsDictionary> {
    const { data: { dictionary } } = await getDealDictionaryApi({ urlParams: dealId });
    return dictionary;
  }

  async updateDealDetails({ dealId, dealDetails }: UpdateDealDetailsParams): Promise<void> {
    await updateDealDetailsApi({ urlParams: dealId, data: { dealDetails } });
  }

  async getGooglePlacesSuggestion(searchText: string) {
    const { data: { data } } = await getGooglePlacesSuggestionApi({ data: { searchText } });
    return data.predictions;
  }

  async getDetailsByPlaceId(placeId: string) {
    const { data: { data } } = await getDetailsByPlaceId({ urlParams: placeId });
    return data.result;
  }

  async deleteDeal(dealId: string) {
    await deleteDealApi({ urlParams: dealId });
  }

  async getDealModelHistory(dealId: string): Promise<DealModelHistory[]> {
    const { data: { modelHistories } } = await getDealModelHistoryApi({ urlParams: dealId });
    return modelHistories;
  }

  async deleteDealModelHistory({ dealId, modelHistoryId }) {
    await deleteDealModelHistoryApi({ urlParams: { dealId, modelHistoryId } });
  }
}

export const useDealService: () => DealService = () => DealService.useService();
