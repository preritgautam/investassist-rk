import React from 'react';
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';


interface BarLineComposedChartProps {
  data: { period: string }[];
  xAxisDataKey: string;
  barDataKey: string,
  lineDataKey: string
}

export function BarLineComposedChart({ data, xAxisDataKey, barDataKey, lineDataKey }: BarLineComposedChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart
        width={500}
        height={400}
        data={data}
        margin={{
          top: 20,
          right: 20,
          bottom: 20,
          left: 20,
        }}
      >
        <CartesianGrid stroke="#f5f5f5" />
        <XAxis dataKey={xAxisDataKey} scale="band" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey={barDataKey} barSize={20} fill="#413ea0" />
        <Line type="monotone" dataKey={lineDataKey} stroke="#ff7300" />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
