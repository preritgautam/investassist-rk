import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { PageComponent } from '../../../src/bootstrap/types';
import { getAccountUserLayout } from '../../../src/app/components/app/layouts/AccountUserLayout2';
import { useSet } from 'react-use';
import { Flex, Heading } from '@chakra-ui/react';
import { Deal } from '../../../src/types';
import { useDealService } from '../../../src/app/services/account/user/DealService';
import { PageContent } from '../../../src/bootstrap/chakra/components/layouts/PageContent';
import { DealFilters, Filters } from '../../../src/app/components/app/comps/DealFilters';
import { DealTagsList } from '../../../src/app/components/app/comps/DealTagsList';
import { DealsList } from '../../../src/app/components/app/comps/DealsList';
import { RoutingService } from '../../../src/app/services/RoutingService';
import { LinkButton } from '../../../src/bootstrap/chakra/components/core/LinkButton';
import { useQueryParam } from '../../../src/bootstrap/hooks/utils/useQueryParam';


interface SelectDealsFormProps {
  preSelectedDealSlugs?: string[];
}

function SelectDealsForm({ preSelectedDealSlugs }: SelectDealsFormProps) {
  const [selectedDeals, { add, remove, reset }] = useSet<Deal>(new Set<Deal>());
  const dealsQuery = useDealService().useQueries().useDeals();

  useEffect(() => {
    if (preSelectedDealSlugs?.length && dealsQuery.data) {
      dealsQuery.data.forEach((d: Deal) => {
        if (preSelectedDealSlugs.includes(d.slug)) {
          add(d);
        }
      });
    }
  }, [preSelectedDealSlugs, dealsQuery.data, add]);

  const handleRemoveDeal = useCallback((deal: Deal) => {
    remove(deal);
  }, [remove]);

  const handleAddDeal = useCallback((deal: Deal) => {
    add(deal);
  }, [add]);

  const [filters, setFilters] = useState<Filters>({});

  const [filteredDeals, setFilteredDeals] = useState<Deal[]>([]);

  useEffect(() => {
    const filtered = (dealsQuery.data ?? []).filter((deal: Deal) => {
      if (filters.name !== undefined) {
        if (!(deal.name + deal.address.line1).toLowerCase().includes(filters.name.toLowerCase())) {
          return false;
        }
      }

      if (filters.zip !== undefined) {
        if (!deal.address.zipCode.toLowerCase().includes(filters.zip.toLowerCase())) {
          return false;
        }
      }

      if (filters.city !== undefined) {
        if (!deal.address.city.toLowerCase().includes(filters.city.toLowerCase())) {
          return false;
        }
      }

      if (filters.buildingType !== undefined) {
        if (deal.details.buildingType && deal.details.buildingType !== filters.buildingType) {
          return false;
        }
      }

      if (filters.yearBuilt !== undefined) {
        if (deal.details.dateBuilt) {
          const min = filters.yearBuilt.min ?? 0;
          const max = filters.yearBuilt.max ?? Infinity;
          const year = parseInt(deal.details.dateBuilt);
          if (year < min || year > max) {
            return false;
          }
        }
      }

      if (filters.yearRenovated !== undefined) {
        if (deal.details.dateRenovated) {
          const min = filters.yearRenovated.min ?? 0;
          const max = filters.yearRenovated.max ?? Infinity;
          const year = parseInt(deal.details.dateRenovated);
          if (year < min || year > max) {
            return false;
          }
        }
      }

      if (filters.noOfUnits !== undefined) {
        if (deal.details.numUnits) {
          const min = filters.noOfUnits.min ?? 0;
          const max = filters.noOfUnits.max ?? Infinity;
          const count = deal.details.numUnits;
          if (count < min || count > max) {
            return false;
          }
        }
      }

      return true;
    });

    setFilteredDeals(filtered);
  }, [filters, dealsQuery.data]);

  const comparePageUrl = useMemo(() => {
    const dealSlugs = Array.from(selectedDeals).map((d: Deal) => d.slug).join(',');
    return `${RoutingService.userCompsComparePage}?deals=${dealSlugs}`;
  }, [selectedDeals]);

  return (
    <>
      <DealFilters onFiltersChanged={setFilters}/>
      <DealTagsList
        deals={selectedDeals} onRemoveDeal={handleRemoveDeal} onRemoveAllDeals={reset}
      />
      <DealsList
        deals={filteredDeals} onAddDeal={handleAddDeal} selectedDeals={selectedDeals} onRemoveDeal={handleRemoveDeal}
      />
      <Flex justifyContent="flex-end" py={2}>
        <LinkButton
          size="sm" isDisabled={selectedDeals.size < 2} variant="solid"
          href={comparePageUrl}
        >Compare Properties</LinkButton>
      </Flex>
    </>
  );
}


const CompsPage: PageComponent = () => {
  const dealSlugs: string[] = (useQueryParam('deals') ?? '').split(',');

  return (
    <PageContent pageTitle="Property Comps" noDivider flexGrow={1}>
      <Heading my={4}>Select Properties to Compare</Heading>
      <SelectDealsForm preSelectedDealSlugs={dealSlugs}/>
    </PageContent>
  );
};

CompsPage.getLayout = getAccountUserLayout;

export default CompsPage;
