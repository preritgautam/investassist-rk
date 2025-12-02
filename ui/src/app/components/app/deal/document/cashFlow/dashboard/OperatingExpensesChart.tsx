import React, { MutableRefObject, useMemo } from 'react';
import { PieChart } from '../../../../../core/recharts/PieChart';

interface OperatingExpensesChartProps {
  data: Record<string, number>
}

export const OperatingExpensesChart =
  React.forwardRef(({ data }: OperatingExpensesChartProps, ref: MutableRefObject<any>) => {
    const pieData = useMemo(() => {
      return Reflect.ownKeys(data)
        .filter((key: string) => !!data[key])
        .map((key: string) => {
          return {
            key: key,
            value: data[key],
          };
        });
    }, [data]);

    return (
      <PieChart data={pieData} format={true} ref={ref}/>
    );
  });
OperatingExpensesChart.displayName = 'OperatingExpensesChart';
