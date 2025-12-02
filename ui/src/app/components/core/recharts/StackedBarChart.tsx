import React, { MutableRefObject } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  YAxisProps,
} from 'recharts';
import { COLORS } from './colors';
import { identity } from '../../../../bootstrap/utils/noop';
import { formatAmount } from '../../../services/utils/utils';


interface StackedBarChartProps {
  data: { period: string }[];
  xAxisDataKey: string;
  barDataKeys: string[],
  yAxisTickFormatter?: YAxisProps['tickFormatter'];
  format?: boolean;
}

export const StackedBarChart =
  React.forwardRef((
    { data, xAxisDataKey, barDataKeys, yAxisTickFormatter = identity, format = false }: StackedBarChartProps,
    ref: MutableRefObject<any>) => {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          width={500}
          height={300}
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 15,
          }}
          ref={ref}
        >
          <CartesianGrid strokeDasharray="3 3"/>
          <XAxis dataKey={xAxisDataKey}/>
          <YAxis tickCount={10} tickFormatter={yAxisTickFormatter}
            tick={({ x, y, payload: { value }, index }) => {
              return (
                <text
                  x={x} y={y} dominantBaseline="central"
                  textAnchor="end" style={{ fontSize: 'small' }}
                >
                  {yAxisTickFormatter(value, index)}
                </text>
              );
            }}/>
          <Tooltip formatter={(value) => format? formatAmount(Number(value)) : value}/>
          <Legend/>
          {barDataKeys.map((entry, index) => (
            <Bar key={entry} dataKey={entry} stackId="a" fill={COLORS[index % COLORS.length]}/>
          ))}
        </BarChart>
      </ResponsiveContainer>
    );
  });
StackedBarChart.displayName = 'StackedBarChart';
