import React, { MutableRefObject, useMemo } from 'react';
import { PieChart } from '../../../../../core/recharts/PieChart';
import { RRBedsUnitCountSummary } from '../../../../../../../types';

interface BedsUnitsCountChartProps {
  data: RRBedsUnitCountSummary;
}

export const BedsUnitsCountChart =
  React.forwardRef(({ data }: BedsUnitsCountChartProps, ref: MutableRefObject<any>) => {
    const pieData = useMemo(() => {
      return Reflect.ownKeys(data)
        .filter((key: string) => !!data[key])
        .map((key: string) => {
          return {
            key: key === '1' ? '1 Bed' : key === 'unknown' ? 'Others' : key === 'studio' ? 'Studio' : `${key} beds`,
            value: data[key],
          };
        });
    }, [data]);

    return (
      <PieChart data={pieData} ref={ref}/>
    );
  });
BedsUnitsCountChart.displayName= 'BedsUnitsCountChart';

