import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Card from './Card';
import { cn } from '../utils/format';

export default function StatCard({ title, value, change, icon: Icon, color = 'brand', index = 0, to, onClick }) {
  const colors = {
    brand: 'from-brand-500 to-brand-600',
    green: 'from-emerald-500 to-emerald-600',
    orange: 'from-orange-500 to-orange-600',
    purple: 'from-purple-500 to-purple-600',
  };

  const inner = (
    <Card
      hover={!!(to || onClick)}
      onClick={onClick}
      className={cn('relative overflow-hidden h-full', (to || onClick) && 'cursor-pointer')}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{value}</p>
          {change !== undefined && (
            <p className={cn('text-sm mt-2', change >= 0 ? 'text-green-600' : 'text-red-600')}>
              {change >= 0 ? '+' : ''}{change}% from last week
            </p>
          )}
        </div>
        {Icon && (
          <div className={cn('p-3 rounded-xl bg-gradient-to-br text-white shadow-lg', colors[color])}>
            <Icon className="h-6 w-6" />
          </div>
        )}
      </div>
    </Card>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="h-full"
    >
      {to ? <Link to={to} className="block h-full">{inner}</Link> : inner}
    </motion.div>
  );
}
