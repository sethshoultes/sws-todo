/**
 * Home Page Component
 * 
 * The landing page component that serves as the entry point for the todo application.
 * Provides an overview of key features and directs users to either sign up or access
 * their todos based on authentication state.
 * 
 * @component
 * 
 * Key Features:
 * - Responsive hero section
 * - Feature highlights
 * - Authentication-aware CTAs
 * - Visual feature icons
 * - Clean, modern design
 * 
 * Integration Points:
 * 1. Authentication:
 *    - Uses AuthContext for user state
 *    - Shows different CTAs based on auth
 *    - Directs to appropriate routes
 * 
 * 2. React Router:
 *    - Link components for navigation
 *    - Route-aware behavior
 *    - Smooth transitions
 * 
 * 3. Layout Component:
 *    - Rendered within main layout
 *    - Consistent styling
 *    - Responsive design
 * 
 * Data Flow:
 * 1. Auth State:
 *    - Checks user authentication
 *    - Updates CTA button
 *    - Directs to appropriate route
 * 
 * UI Sections:
 * 1. Hero:
 *    - Main heading
 *    - Subheading
 *    - Primary CTA button
 * 
 * 2. Features Grid:
 *    - Organization
 *    - Collaboration
 *    - Offline support
 */

import { Link } from 'react-router-dom';
import { CheckSquare, Share2, Shield } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="max-w-4xl mx-auto">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Organize Your Life with SWS Todo
        </h1>
        <p className="text-xl text-gray-600">
          A powerful todo app with collaboration features and offline support
        </p>
      </div>

      {/* CTA Button */}
      <div className="text-center mb-8">
        {user ? (
          <Link
            to="/todos"
            className="bg-indigo-600 text-white px-8 py-3 rounded-md text-lg font-medium hover:bg-indigo-700 transition-colors"
            aria-label="View your todos"
          >
            Go to My Todos
          </Link>
        ) : (
          <Link
            to="/register"
            className="bg-indigo-600 text-white px-8 py-3 rounded-md text-lg font-medium hover:bg-indigo-700 transition-colors"
            aria-label="Create a new account"
          >
            Get Started
          </Link>
        )}
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-3 gap-8 mb-12">
        {/* Organization Feature */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <CheckSquare 
            className="h-12 w-12 text-indigo-600 mb-4" 
            aria-hidden="true"
          />
          <h2 className="text-xl font-semibold mb-2">Stay Organized</h2>
          <p className="text-gray-600">
            Keep track of your tasks with a clean and intuitive interface
          </p>
        </div>

        {/* Collaboration Feature */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <Share2 
            className="h-12 w-12 text-indigo-600 mb-4" 
            aria-hidden="true"
          />
          <h2 className="text-xl font-semibold mb-2">Collaborate</h2>
          <p className="text-gray-600">
            Share your todo lists with friends and family
          </p>
        </div>

        {/* Offline Support Feature */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <Shield 
            className="h-12 w-12 text-indigo-600 mb-4" 
            aria-hidden="true"
          />
          <h2 className="text-xl font-semibold mb-2">Work Offline</h2>
          <p className="text-gray-600">
            Access your todos even without an internet connection
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Component Usage Example:
 * 
 * ```tsx
 * import { BrowserRouter, Routes, Route } from 'react-router-dom';
 * import Home from './pages/Home';
 * import { AuthProvider } from './contexts/AuthContext';
 * 
 * function App() {
 *   return (
 *     <AuthProvider>
 *       <BrowserRouter>
 *         <Routes>
 *           <Route path="/" element={<Layout />}>
 *             <Route index element={<Home />} />
 *           </Route>
 *         </Routes>
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