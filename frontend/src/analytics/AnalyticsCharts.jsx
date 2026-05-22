import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import Card, { CardHeader } from '../shared/Card';

export function PriorityBarChart({ data }) {
  const chartData = Object.entries(data || {}).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    count: value,
  }));

  return (
    <Card>
      <CardHeader title="Tasks by Priority" />
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}

export function ProjectProgressChart({ projects = [] }) {
  const chartData = projects.map((p) => ({
    name: p.key,
    total: p.totalTasks,
    completed: p.completedTasks,
    rate: p.totalTasks ? Math.round((p.completedTasks / p.totalTasks) * 100) : 0,
  }));

  return (
    <Card>
      <CardHeader title="Project Completion" subtitle="Tasks completed per project" />
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="rate" stroke="#6366f1" strokeWidth={2} name="Completion %" />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}
