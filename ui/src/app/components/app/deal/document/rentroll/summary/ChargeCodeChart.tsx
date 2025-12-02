import React, { MutableRefObject, useMemo } from 'react';
import { BarChart } from '../../../../../core/recharts/BarChart';
import { formatAmount } from '../../../../../../services/utils/utils';
import { ChargeCodeChartSummary } from '../../../../../../../types';

interface ChargeCodeChartProps {
  data: ChargeCodeChartSummary;
}

export const ChargeCodeChart = React.forwardRef(({ data }: ChargeCodeChartProps, ref: MutableRefObject<any>) => {
  const barData = useMemo(() => {
    return Reflect.ownKeys(data)
      .filter((key: string) => !!data[key])
      .map((key: string) => ({ key: key.replace(/([A-Z])/g, ' $1').trim(), value: data[key] }));
  }, [data]);

  return (
    <BarChart data={barData} yAxisTickFormatter={(v) => formatAmount(v).slice(0, -3)} format={true} ref={ref}/>
  );
});
ChargeCodeChart.displayName = 'ChargeCodeChart';
