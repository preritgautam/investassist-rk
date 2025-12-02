import { Deal } from '../../../types';
import { useQueryParam } from '../../../bootstrap/hooks/utils/useQueryParam';
import { useDealService } from '../../services/account/user/DealService';
import { UseQueryOptions } from 'react-query';

type UseDealByRouteSlugReturn = [Deal | null, boolean, boolean, () => Promise<any>];

export function useDealByRouteSlug(options: UseQueryOptions<Deal> = {}): UseDealByRouteSlugReturn {
  const slug = useQueryParam('slug');
  const dealService = useDealService();
  const { useDealBySlug } = dealService.useQueries();
  const dealQuery = useDealBySlug(slug, options);
  const { data: deal, isLoading, isError, refetch } = dealQuery;
  return [deal, isLoading, isError, refetch];
}
