import {
  Bar,
  BarChart as RBarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  XAxisProps,
  YAxis,
  YAxisProps,
} from 'recharts';
import React, { MutableRefObject } from 'react';
import { identity } from '../../../../bootstrap/utils/noop';
import { formatAmount } from '../../../services/utils/utils';

interface BarChartProps {
  data: { key: string, value: number }[];
  yAxisTickFormatter?: YAxisProps['tickFormatter'];
  xAxisTickFormatter?: XAxisProps['tickFormatter'];
  format?: boolean;
}

export const BarChart =
  React.forwardRef((
    { data, yAxisTickFormatter = identity, xAxisTickFormatter = identity, format = false }: BarChartProps,
    ref: MutableRefObject<any>) => {
    return (
      <ResponsiveContainer width="100%">
        <RBarChart data={data} margin={{ top: 20, right: 15, bottom: 15, left: 25 }} ref={ref}>
          <XAxis
            dataKey="key" tickFormatter={xAxisTickFormatter}
            tick={({ x, y, payload: { value }, index }) => {
              return (
                <text
                  x={x} y={y + 8} dominantBaseline="central"
                  textAnchor="middle" style={{ fontSize: 'small' }}
                >
                  {xAxisTickFormatter(value, index)}
                </text>
              );
            }}
          />
          <YAxis
            tickCount={10} tickFormatter={yAxisTickFormatter}
            tick={({ x, y, payload: { value }, index }) => {
              return (
                <text
                  x={x} y={y} dominantBaseline="central"
                  textAnchor="end" style={{ fontSize: 'small' }}
                >
                  {yAxisTickFormatter(value, index)}
                </text>
              );
            }}
          />
          <Tooltip formatter={(value) => format? formatAmount(Number(value)) : value}/>
          <Bar dataKey="value" fill="#92b4ec" maxBarSize={64}>
          </Bar>
        </RBarChart>
      </ResponsiveContainer>
    );
  });
BarChart.displayName = 'BarChart';
