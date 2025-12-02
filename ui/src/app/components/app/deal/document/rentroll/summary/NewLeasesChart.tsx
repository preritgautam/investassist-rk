import React, { MutableRefObject, useMemo } from 'react';
import { Center } from '@chakra-ui/react';
import { BarChart } from '../../../../../core/recharts/BarChart';
import { isoMonthToShortDate } from '../../../../../../services/utils/utils';
import { NewLeasesChartSummary } from '../../../../../../../types';

interface NewLeasesChartProps {
  data: NewLeasesChartSummary;
}

export const NewLeasesChart = React.forwardRef(({ data }: NewLeasesChartProps, ref: MutableRefObject<any>) => {
  const barData = useMemo(() => {
    return Reflect.ownKeys(data).sort()
      .filter((key: string) => key !== 'unknown' && !!data[key])
      .map((key: string) => ({ key, value: data[key] }));
  }, [data]);

  if (!barData.length) {
    return <Center>Loading...</Center>;
  }

  return (
    <BarChart data={barData} xAxisTickFormatter={isoMonthToShortDate} ref={ref}/>
  );
});
NewLeasesChart.displayName = 'NewLeasesChart';
