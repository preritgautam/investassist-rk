import { AffordableChartSummary } from '../../../../../../../types';
import React, { MutableRefObject, useMemo } from 'react';
import { PieChart } from '../../../../../core/recharts/PieChart';

interface AffordableChartProps {
  data: AffordableChartSummary;
}

export const AffordableChart = React.forwardRef(({ data }: AffordableChartProps, ref: MutableRefObject<any>) => {
  const pieData = useMemo(() => {
    return Reflect.ownKeys(data)
      .filter((key: string) => !!data[key])
      .map((key: string) => ({ key, value: data[key] }));
  }, [data]);

  return (
    <PieChart data={pieData} ref={ref}/>
  );
});
AffordableChart.displayName = 'AffordableChart';
