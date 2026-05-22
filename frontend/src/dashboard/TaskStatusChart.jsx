import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import Card, { CardHeader } from '../shared/Card';

const COLORS = ['#94a3b8', '#3b82f6', '#a855f7', '#22c55e', '#ef4444'];

export default function TaskStatusChart({ data }) {
  const chartData = Object.entries(data || {}).map(([name, value]) => ({
    name: name.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
    value,
  }));

  if (!chartData.length) {
    return (
      <Card>
        <CardHeader title="Tasks by Status" />
        <p className="text-sm text-gray-500 text-center py-8">No task data available</p>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader title="Tasks by Status" subtitle="Distribution across workflow" />
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
            dataKey="value"
          >
            {chartData.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </Card>
  );
}
