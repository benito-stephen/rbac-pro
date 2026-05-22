import { motion } from 'framer-motion';
import Button from './Button';

export default function EmptyState({ icon: Icon, title, description, action, actionTo, actionLabel }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 px-4 text-center"
    >
      {Icon && (
        <div className="mb-4 p-4 rounded-2xl bg-gray-100 dark:bg-slate-800">
          <Icon className="h-10 w-10 text-gray-400" />
        </div>
      )}
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mb-6">{description}</p>
      {actionLabel && (actionTo ? (
        <Button to={actionTo}>{actionLabel}</Button>
      ) : action ? (
        <Button onClick={action}>{actionLabel}</Button>
      ) : null)}
    </motion.div>
  );
}
