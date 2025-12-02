import React, { MutableRefObject, useMemo } from 'react';
import { formatAmount, getMonthYear } from '../../../../../../services/utils/utils';
import { StackedBarChart } from '../../../../../core/recharts/StackedBarChart';
import { GPRChartCategories } from '../../../../../../../constants';

export interface GPRPeriodData {
  'Gross Potential Rent': number;
  'Collection Loss': number;
  'Non - Revenue Units': number;
  'Concessions': number;
  'Physical Vacancy': number;
}

interface GPRChartProps {
  data: Record<string, GPRPeriodData>;
}


export const GPRChart =
  React.forwardRef(({ data }: GPRChartProps, ref: MutableRefObject<any>) => {
    const barData = useMemo(() => {
      return Reflect.ownKeys(data)
        .filter((key: string) => !!data[key])
        .map((key: string) => (
          {
            period: getMonthYear(key),
            ...data[key],
          }
        ));
    }, [data]);


    return (
      <StackedBarChart data={barData} xAxisDataKey="period" barDataKeys={GPRChartCategories}
        yAxisTickFormatter={(v) => formatAmount(v).slice(0, -3)} format={true} ref={ref}/>
    );
  });
GPRChart.displayName = 'GPRChart';

