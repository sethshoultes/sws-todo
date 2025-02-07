/**
 * AuthContext & AuthProvider
 * 
 * A React Context and Provider implementation that manages authentication state
 * and provides authentication-related functionality throughout the application.
 * Integrates with Supabase for authentication services.
 * 
 * Key Features:
 * - User state management
 * - Authentication operations (sign in, sign up, sign out)
 * - Loading state handling
 * - Session persistence
 * - Real-time auth state updates
 * 
 * Integration Points:
 * 1. Supabase:
 *    - Auth state management
 *    - Session handling
 *    - Real-time subscriptions
 * 
 * 2. Protected Routes:
 *    - Access control
 *    - Redirect handling
 *    - Loading states
 * 
 * 3. Components:
 *    - Navbar for auth UI
 *    - Login/Register forms
 *    - Protected content
 * 
 * Data Flow:
 * 1. Initial Load:
 *    - Check for existing session
 *    - Subscribe to auth changes
 *    - Set initial loading state
 * 
 * 2. Auth State Changes:
 *    - Update user state
 *    - Notify subscribers
 *    - Update UI accordingly
 * 
 * 3. Auth Operations:
 *    - Handle auth requests
 *    - Update local state
 *    - Propagate changes
 * 
 * Security:
 * - Secure session management
 * - Protected route integration
 * - Error handling
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

/**
 * Authentication context type definition
 */
interface AuthContextType {
  /** Current authenticated user or null */
  user: User | null;
  /** Whether auth state is being determined */
  loading: boolean;
  /** Sign in with email and password */
  signIn: (email: string, password: string) => Promise<void>;
  /** Create new account with email and password */
  signUp: (email: string, password: string) => Promise<void>;
  /** Sign out current user */
  signOut: () => Promise<void>;
}

// Create context with undefined default value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Authentication Provider component
 * Manages auth state and provides auth operations to children
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active sessions and subscribe to auth changes
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => subscription.unsubscribe();
  }, []);

  /**
   * Signs in a user with email and password
   * @throws {Error} If sign in fails
   */
  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  /**
   * Creates a new user account
   * @throws {Error} If sign up fails
   */
  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
  };

  /**
   * Signs out the current user
   * @throws {Error} If sign out fails
   */
  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Custom hook to use authentication context
 * @throws {Error} If used outside of AuthProvider
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

/**
 * Component Usage Example:
 * 
 * ```tsx
 * // App.tsx
 * import { AuthProvider } from './contexts/AuthContext';
 * 
 * function App() {
 *   return (
 *     <AuthProvider>
 *       <BrowserRouter>
 *         <Routes>
 *           <Route path="/login" element={<Login />} />
 *           <Route
 *             path="/todos"
 *             element={
 *               <ProtectedRoute>
 *                 <TodoList />
 *               </ProtectedRoute>
 *             }
 *           />
 *         </Routes>
 *       </BrowserRouter>
 *     </AuthProvider>
 *   );
 * }
 * 
 * // Component using auth
 * function TodoList() {
 *   const { user, signOut } = useAuth();
 *   
 *   return (
 *     <div>
 *       <p>Welcome, {user?.email}</p>
 *       <button onClick={signOut}>Sign Out</button>
 *     </div>
 *   );
 * }
 * ```
 * 
 * @see {@link ProtectedRoute} For route protection implementation
 * @see {@link Login} For login form implementation
 * @see {@link Register} For registration form implementation
 */