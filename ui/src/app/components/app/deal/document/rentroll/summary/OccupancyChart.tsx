import { OccupancyChartSummary } from '../../../../../../../types';
import React, { MutableRefObject, useMemo } from 'react';
import { PieChart } from '../../../../../core/recharts/PieChart';

interface OccupancyChartProps {
  data: OccupancyChartSummary;
}

export const OccupancyChart = React.forwardRef(({ data }: OccupancyChartProps, ref: MutableRefObject<any>) => {
  const pieData = useMemo(() => {
    return Reflect.ownKeys(data)
      .filter((key: string) => !!data[key])
      .map((key: string) => ({ key, value: data[key] }));
  }, [data]);

  return (
    <PieChart data={pieData} ref={ref}/>
  );
});
OccupancyChart.displayName = 'OccupancyChart';
