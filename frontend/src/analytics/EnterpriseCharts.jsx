import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import Card, { CardHeader } from '../shared/Card';

const chartColors = {
  primary: '#6366f1',
  secondary: '#a855f7',
  success: '#22c55e',
  grid: 'rgba(148,163,184,0.2)',
};

export function WeeklyGrowthChart({ users = [], tasks = [] }) {
  const merged = {};
  users.forEach((d) => { merged[d.date] = { ...merged[d.date], date: d.date, users: d.count }; });
  tasks.forEach((d) => { merged[d.date] = { ...merged[d.date], date: d.date, tasks: d.count }; });
  const data = Object.values(merged).sort((a, b) => a.date.localeCompare(b.date));

  return (
    <Card>
      <CardHeader title="Weekly Growth" subtitle="New users & tasks (7 days)" />
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={chartColors.primary} stopOpacity={0.3} />
              <stop offset="95%" stopColor={chartColors.primary} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
          <XAxis dataKey="date" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip />
          <Legend />
          <Area type="monotone" dataKey="users" stroke={chartColors.primary} fill="url(#colorUsers)" />
          <Area type="monotone" dataKey="tasks" stroke={chartColors.secondary} fill="transparent" />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  );
}

export function CompletionTrendChart({ data = [] }) {
  return (
    <Card>
      <CardHeader title="Completion Trends" subtitle="Tasks completed over time" />
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
          <XAxis dataKey="date" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip />
          <Line type="monotone" dataKey="count" stroke={chartColors.success} strokeWidth={2} dot={{ r: 4 }} />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}

export function ActivityHeatChart({ data = [] }) {
  return (
    <Card>
      <CardHeader title="System Activity" subtitle="Daily activity volume" />
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
          <XAxis dataKey="date" tick={{ fontSize: 10 }} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip />
          <Bar dataKey="count" fill={chartColors.primary} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}

export function MostActiveUsersTable({ users = [] }) {
  return (
    <Card>
      <CardHeader title="Most Active Users" subtitle="By task volume" />
      <div className="space-y-3">
        {users.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">No data</p>
        ) : (
          users.map((u, i) => (
            <div key={u._id || i} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-slate-800/50">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-brand-600 w-5">#{i + 1}</span>
                <span className="font-medium text-sm">{u.name}</span>
              </div>
              <span className="text-sm text-gray-500">{u.taskCount} tasks</span>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
