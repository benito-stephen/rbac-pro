import { ShieldOff } from 'lucide-react';
import Button from '../shared/Button';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <div className="glass-card p-10 rounded-2xl max-w-md">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-6">
          <ShieldOff className="h-8 w-8 text-red-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Access Denied</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">
          You don't have permission to view this page. Contact your administrator if you believe this is an error.
        </p>
        <div className="flex gap-3 justify-center mt-8">
          <Button to="/dashboard" variant="secondary">
            Dashboard
          </Button>
          <Button to="/">
            Go Home
          </Button>
        </div>
      </div>
    </div>
  );
}
