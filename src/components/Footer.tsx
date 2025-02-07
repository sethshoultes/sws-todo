/**
 * Footer Component
 * 
 * A footer component that displays the current page path and a GitHub link.
 * Uses React Router's location to dynamically show the current page's source file path.
 * 
 * @component
 * 
 * Key Features:
 * - Dynamic page path display
 * - GitHub repository link
 * - Responsive layout
 * - Fixed positioning at bottom
 * 
 * Integration Points:
 * 1. React Router:
 *    - Uses useLocation hook for current route
 *    - Maps routes to source file paths
 * 
 * 2. Layout Component:
 *    - Rendered as part of the main layout
 *    - Maintains consistent positioning
 * 
 * Data Flow:
 * 1. Route Change:
 *    - Location updates from React Router
 *    - Component maps new path to source file
 *    - UI updates to show current file path
 */

import { Github } from 'lucide-react';
import { useLocation } from 'react-router-dom';

/**
 * Maps route paths to their corresponding source file paths
 */
const pageMap: Record<string, string> = {
  '/': 'src/pages/Home.tsx',
  '/todos': 'src/pages/TodoList.tsx',
  '/login': 'src/pages/Login.tsx',
  '/register': 'src/pages/Register.tsx',
};

export default function Footer() {
  const location = useLocation();
  const currentPage = pageMap[location.pathname] || 'Unknown Page';

  return (
    <footer className="bg-white border-t mt-auto">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <p className="text-sm text-gray-600">
          Current Page: <code className="bg-gray-100 px-2 py-1 rounded">{currentPage}</code>
        </p>
        <a
          href="https://github.com/sethshoultes"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-600 hover:text-gray-900 transition-colors"
          aria-label="View GitHub profile"
        >
          <Github className="h-5 w-5" aria-hidden="true" />
        </a>
      </div>
    </footer>
  );
}

/**
 * Component Usage Example:
 * 
 * ```tsx
 * import Footer from './components/Footer';
 * 
 * function Layout() {
 *   return (
 *     <div className="min-h-screen flex flex-col">
 *       <main className="flex-grow">
 *         {/* Main content *\/}
 *       </main>
 *       <Footer />
 *     </div>
 *   );
 * }
 * ```
 * 
 * @see {@link Layout} For the parent layout component
 */