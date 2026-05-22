import { FileQuestion } from 'lucide-react';
import Button from '../shared/Button';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <FileQuestion className="h-20 w-20 text-gray-300 mb-6" />
      <h1 className="text-4xl font-bold text-gray-900 dark:text-white">404</h1>
      <p className="text-gray-500 mt-2 mb-8">Page not found</p>
      <div className="flex gap-3">
        <Button to="/dashboard">Dashboard</Button>
        <Button to="/" variant="secondary">Home</Button>
      </div>
    </div>
  );
}
