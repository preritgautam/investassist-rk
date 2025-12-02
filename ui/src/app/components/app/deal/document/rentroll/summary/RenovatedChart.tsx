import React, { MutableRefObject, useMemo } from 'react';
import { PieChart } from '../../../../../core/recharts/PieChart';
import { RenovatedChartSummary } from '../../../../../../../types';

interface RenovatedChartProps {
  data: RenovatedChartSummary;
}

export const RenovatedChart = React.forwardRef(({ data }: RenovatedChartProps, ref: MutableRefObject<any>) => {
  const pieData = useMemo(() => {
    return Reflect.ownKeys(data)
      .filter((key: string) => !!data[key])
      .map((key: string) => ({ key, value: data[key] }));
  }, [data]);

  return (
    <PieChart data={pieData} ref={ref}/>
  );
});
RenovatedChart.displayName = 'RenovatedChart';
