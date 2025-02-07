/**
 * ProtectedRoute Component
 * 
 * A wrapper component that protects routes requiring authentication.
 * Redirects unauthenticated users to the login page and shows a loading
 * state while checking authentication status.
 * 
 * @component
 * 
 * Key Features:
 * - Authentication verification
 * - Automatic redirection
 * - Loading state handling
 * - Route protection
 * 
 * Integration Points:
 * 1. Authentication:
 *    - Uses AuthContext for user state
 *    - Handles loading states
 *    - Manages redirects
 * 
 * 2. React Router:
 *    - Navigate component for redirection
 *    - Protects specific routes
 *    - Maintains URL history
 * 
 * 3. Protected Components:
 *    - Wraps authenticated-only components
 *    - Ensures secure access
 *    - Preserves component state
 * 
 * Data Flow:
 * 1. Initial Load:
 *    - Checks authentication state
 *    - Shows loading spinner
 *    - Waits for auth resolution
 * 
 * 2. Auth Check:
 *    - If authenticated: Renders protected content
 *    - If unauthenticated: Redirects to login
 *    - If loading: Shows loading state
 * 
 * Security:
 * - Prevents unauthorized access
 * - Maintains authentication state
 * - Handles session expiry
 */

import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  /** The component or elements to render when authenticated */
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center"
        role="status"
        aria-label="Checking authentication"
      >
        <div 
          className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"
          aria-hidden="true"
        />
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Render protected content if authenticated
  return <>{children}</>;
}

/**
 * Component Usage Example:
 * 
 * ```tsx
 * import { BrowserRouter, Routes, Route } from 'react-router-dom';
 * import ProtectedRoute from './components/ProtectedRoute';
 * import TodoList from './pages/TodoList';
 * 
 * function App() {
 *   return (
 *     <BrowserRouter>
 *       <Routes>
 *         <Route path="/" element={<Layout />}>
 *           <Route
 *             path="todos"
 *             element={
 *               <ProtectedRoute>
 *                 <TodoList />
 *               </ProtectedRoute>
 *             }
 *           />
 *         </Route>
 *       </Routes>
 *     </BrowserRouter>
 *   );
 * }
 * ```
 * 
 * @see {@link AuthContext} For authentication state management
 * @see {@link App} For routing setup
 * @see {@link TodoList} For an example protected component
 */