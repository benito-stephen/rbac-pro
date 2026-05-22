import { Search, Filter, X } from 'lucide-react';
import Input from '../../shared/Input';
import Button from '../../shared/Button';
import { TASK_STATUS, TASK_PRIORITY, TASK_STATUS_LABELS } from '../../constants';

export default function TaskFilters({ filters, onChange, onReset }) {
  const update = (key, value) => onChange({ ...filters, [key]: value, page: 1 });

  return (
    <div className="flex flex-col lg:flex-row gap-3 mb-6">
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search tasks, tags..."
          value={filters.search || ''}
          onChange={(e) => update('search', e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none"
        />
      </div>
      <div className="flex flex-wrap gap-2">
        <select
          value={filters.status || ''}
          onChange={(e) => update('status', e.target.value || undefined)}
          className="px-3 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
        >
          <option value="">All statuses</option>
          {Object.values(TASK_STATUS).map((s) => (
            <option key={s} value={s}>{TASK_STATUS_LABELS[s]}</option>
          ))}
        </select>
        <select
          value={filters.priority || ''}
          onChange={(e) => update('priority', e.target.value || undefined)}
          className="px-3 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
        >
          <option value="">All priorities</option>
          {Object.values(TASK_PRIORITY).map((p) => (
            <option key={p} value={p} className="capitalize">{p}</option>
          ))}
        </select>
        <select
          value={filters.sortBy || 'updatedAt'}
          onChange={(e) => update('sortBy', e.target.value)}
          className="px-3 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
        >
          <option value="updatedAt">Last updated</option>
          <option value="dueDate">Due date</option>
          <option value="priority">Priority</option>
          <option value="title">Title</option>
          <option value="createdAt">Created</option>
        </select>
        <select
          value={filters.order || 'desc'}
          onChange={(e) => update('order', e.target.value)}
          className="px-3 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
        >
          <option value="desc">Desc</option>
          <option value="asc">Asc</option>
        </select>
        {(filters.search || filters.status || filters.priority) && (
          <Button variant="ghost" size="sm" icon={X} onClick={onReset}>Clear</Button>
        )}
      </div>
    </div>
  );
}
