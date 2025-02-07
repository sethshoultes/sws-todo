/**
 * Login Page Component
 * 
 * A form-based authentication page that handles user login using email and password.
 * Integrates with Supabase authentication and provides feedback through toast
 * notifications.
 * 
 * @component
 * 
 * Key Features:
 * - Email/password authentication
 * - Form validation
 * - Loading state handling
 * - Error feedback
 * - Responsive design
 * - Accessible form controls
 * 
 * Integration Points:
 * 1. Authentication:
 *    - Uses AuthContext for sign-in
 *    - Manages auth state
 *    - Handles auth errors
 * 
 * 2. React Router:
 *    - Handles navigation
 *    - Post-login redirect
 *    - Registration link
 * 
 * 3. Toast Notifications:
 *    - Success messages
 *    - Error feedback
 *    - User guidance
 * 
 * Data Flow:
 * 1. Form Input:
 *    - Email validation
 *    - Password requirements
 *    - Submit handling
 * 
 * 2. Authentication:
 *    - Credentials verification
 *    - Session creation
 *    - Error handling
 * 
 * 3. Post-Auth:
 *    - Success notification
 *    - Redirect to todos
 *    - Error feedback
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Hooks
  const navigate = useNavigate();
  const { signIn } = useAuth();

  /**
   * Handles form submission and authentication
   * @param e - Form submission event
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await signIn(email, password);
      toast.success('Welcome back!');
      navigate('/todos');
    } catch (error) {
      toast.error('Failed to sign in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h2 
          className="text-2xl font-bold text-center mb-6"
          id="login-title"
        >
          Welcome Back
        </h2>
        <form 
          onSubmit={handleSubmit} 
          className="space-y-4"
          aria-labelledby="login-title"
        >
          {/* Email field */}
          <div>
            <label 
              htmlFor="email" 
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
              aria-required="true"
              autoComplete="email"
            />
          </div>

          {/* Password field */}
          <div>
            <label 
              htmlFor="password" 
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
              aria-required="true"
              autoComplete="current-password"
            />
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Registration link */}
        <p className="mt-4 text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <Link 
            to="/register" 
            className="text-indigo-600 hover:text-indigo-500"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

/**
 * Component Usage Example:
 * 
 * ```tsx
 * import { BrowserRouter, Routes, Route } from 'react-router-dom';
 * import Login from './pages/Login';
 * import { AuthProvider } from './contexts/AuthContext';
 * 
 * function App() {
 *   return (
 *     <AuthProvider>
 *       <BrowserRouter>
 *         <Routes>
 *           <Route path="/login" element={<Login />} />
 *         </Routes>
 *       </BrowserRouter>
 *     </AuthProvider>
 *   );
 * }
 * ```
 * 
 * @see {@link AuthContext} For authentication state management
 * @see {@link Register} For the registration page
 * @see {@link ProtectedRoute} For route protection implementation
 */