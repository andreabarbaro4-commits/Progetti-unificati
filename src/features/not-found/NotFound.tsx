import { Link } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { centeredPageLayout } from '../../lib/styles';

function NotFound() {
  return (
    <div className={cn(centeredPageLayout, 'flex-col px-4')}>
      <h1 className="text-6xl font-bold text-gray-800">404</h1>
      <p className="mt-4 text-xl text-gray-600">Page not found</p>
      <p className="mt-2 text-gray-500">
        The page you are looking for does not exist.
      </p>
      <Link
        to="/"
        className="mt-6 inline-flex items-center min-h-11 md:min-h-0 rounded-md bg-indigo-600 px-4 py-2 text-white transition-colors hover:bg-indigo-700"
      >
        Go back home
      </Link>
    </div>
  );
}

export default NotFound;
