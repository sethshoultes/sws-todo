/**
 * Navbar Component
 * 
 * A responsive navigation header component that provides global navigation and
 * authentication state management. Adapts its interface based on user authentication
 * status and provides access to key application features.
 * 
 * @component
 * 
 * Key Features:
 * - Responsive design
 * - Authentication-aware navigation
 * - Dynamic route handling
 * - Consistent branding
 * - Smooth transitions
 * 
 * Integration Points:
 * 1. Authentication:
 *    - Uses AuthContext for user state
 *    - Handles logout functionality
 *    - Shows auth-specific navigation
 * 
 * 2. React Router:
 *    - Link components for navigation
 *    - Route-aware highlighting
 *    - Client-side routing
 * 
 * 3. Layout Component:
 *    - Fixed positioning at top
 *    - Consistent across pages
 *    - Container width matching
 * 
 * Data Flow:
 * 1. Auth State:
 *    - Subscribes to auth context
 *    - Updates UI based on user state
 *    - Handles logout action
 * 
 * 2. Navigation:
 *    - Routes user requests
 *    - Updates URL
 *    - Maintains history
 * 
 * UI States:
 * 1. Authenticated:
 *    - My Todos link
 *    - Logout button
 *    - User-specific actions
 * 
 * 2. Unauthenticated:
 *    - Login link
 *    - Sign Up button
 *    - Public routes only
 */

import { Link } from 'react-router-dom';
import { CheckSquare, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
  const { user, signOut } = useAuth();

  return (
    <nav className="bg-white shadow" role="navigation" aria-label="Main navigation">
      <div className="container mx-auto px-4">
        <div className="flex justify-between h-16">
          {/* Logo and brand */}
          <div className="flex items-center">
            <Link 
              to="/" 
              className="flex items-center space-x-2"
              aria-label="Home"
            >
              <CheckSquare className="h-6 w-6 text-indigo-600" aria-hidden="true" />
              <span className="text-xl font-bold text-gray-900">SWS Todo</span>
            </Link>
          </div>

          {/* Navigation links */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Link
                  to="/todos"
                  className="text-gray-700 hover:text-indigo-600 transition-colors"
                  aria-label="View my todos"
                >
                  My Todos
                </Link>
                <button
                  onClick={() => signOut()}
                  className="flex items-center space-x-1 text-gray-700 hover:text-indigo-600 transition-colors"
                  aria-label="Sign out"
                >
                  <LogOut className="h-5 w-5" aria-hidden="true" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-indigo-600 transition-colors"
                  aria-label="Sign in to your account"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
                  aria-label="Create a new account"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

/**
 * Component Usage Example:
 * 
 * ```tsx
 * import Navbar from './components/Navbar';
 * import { AuthProvider } from '../contexts/AuthContext';
 * 
 * function App() {
 *   return (
 *     <AuthProvider>
 *       <BrowserRouter>
 *         <div className="min-h-screen">
 *           <Navbar />
 *           {/* Other content *\/}
 *         </div>
 *       </BrowserRouter>
 *     </AuthProvider>
 *   );
 * }
 * ```
 * 
 * @see {@link AuthContext} For authentication state management
 * @see {@link Layout} For the parent layout component
 * @see {@link App} For the routing setup
 */