import { Deal, DealsFilterValues } from '../../../types';
import { useDealService } from '../../services/account/user/DealService';
import { useMemo } from 'react';
import { noopArray } from '../../../bootstrap/utils/noop';

export type UseFilteredDealsReturn = {
  deals: Deal[];
  unFilteredDealsPresent: boolean;
  isLoading: boolean;
}

export function useFilteredDeals({ name, address, status, assignedTo }: DealsFilterValues): UseFilteredDealsReturn {
  const dealsQuery = useDealService().useQueries().useDeals();
  const allDeals: Deal[] = dealsQuery.data ?? noopArray;
  const { isLoading } = dealsQuery;

  const nameFilteredDeals: Deal[] = useMemo(() => {
    return (name && allDeals.length) ?
      allDeals.filter((deal) => deal.name.toLowerCase().includes(name)) :
      allDeals;
  }, [allDeals, name]);

  const addressFilteredDeals: Deal[] = useMemo(() => {
    return (address && nameFilteredDeals) ? nameFilteredDeals.filter((deal) => {
      const { line1, line2, city, state, zipCode } = deal.address;
      const addressLine = `${line1} ${line2} ${city} ${state} ${zipCode}`.toLowerCase();
      return addressLine.includes(address);
    }) : nameFilteredDeals;
  }, [nameFilteredDeals, address]);

  const statusFilteredDeals: Deal[] = useMemo(() => {
    return status ? addressFilteredDeals.filter((deal) => deal.status === status) : addressFilteredDeals;
  }, [addressFilteredDeals, status]);

  const assigneeFilteredDeals: Deal[] = useMemo(() => {
    return assignedTo ?
      statusFilteredDeals.filter((deal) => deal.assignedToUser.id === assignedTo) :
      statusFilteredDeals;
  }, [statusFilteredDeals, assignedTo]);

  return { deals: assigneeFilteredDeals, unFilteredDealsPresent: allDeals.length > 0, isLoading };
}
