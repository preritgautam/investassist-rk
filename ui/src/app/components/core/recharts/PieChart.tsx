import React, { MutableRefObject } from 'react';
import { Cell, Legend, Pie, PieChart as RPieChart, ResponsiveContainer, Tooltip, TooltipProps } from 'recharts';
import { formatAmount, increaseBrightness } from '../../../services/utils/utils';
import { Box, Heading } from '@chakra-ui/react';
import { COLORS } from './colors';

const RADIAN = Math.PI / 180;
const customLabel = (props, format) => {
  // eslint-disable-next-line react/prop-types
  const { cx, cy, midAngle, innerRadius, outerRadius, percent, value, fill } = props;
  const radius = innerRadius + (outerRadius - innerRadius) * 1.4;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  const val = format ? formatAmount(Number(value)) : value;

  return (
    <text
      x={x} y={y} fill={fill} textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central"
      style={{ fontSize: 'small' }}
    >
      {`${(percent * 100).toFixed(0)}% (${val})`}
    </text>
  );
};
const customTooltip = (props, format) => {
  const { active, payload }: TooltipProps<any, any> = props;
  if (active && payload && payload.length) {
    const { name, value, payload: { fill } } = payload[0];
    const darkerColor = increaseBrightness(fill, -45);
    const val = format ? formatAmount(Number(value)) : value;
    return (
      <Box border="1px solid" p={1} bg={`${fill}d7`} borderColor={darkerColor}>
        <Heading size="xs" textColor={darkerColor}>{name}: {val}</Heading>
      </Box>
    );
  }

  return null;
};

interface PieChartProps {
  data: { key: string, value: number }[];
  format?: boolean;
}

export const PieChart = React.forwardRef(({ data, format = false }: PieChartProps,
  ref: MutableRefObject<any>) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <RPieChart ref={ref} margin={{ top: 20, bottom: 15, right: 10, left: 10 }}>
        <Pie isAnimationActive={false}
          data={data} dataKey="value" nameKey="key" outerRadius={120} innerRadius={40}
          cx="50%" cy="50%" label={(props) => customLabel(props, format)} labelLine
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]}/>
          ))}
        </Pie>
        <Legend/>
        <Tooltip content={(props) => customTooltip(props, format)}/>
      </RPieChart>
    </ResponsiveContainer>
  );
});
PieChart.displayName = 'PieChart';
