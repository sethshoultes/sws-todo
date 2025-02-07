/**
 * Supabase Client Configuration
 * 
 * Initializes and exports a strongly-typed Supabase client instance for database
 * operations, authentication, and real-time subscriptions. This is a critical
 * module that serves as the central point of database connectivity for the
 * application.
 * 
 * Key Features:
 * - Typed database operations
 * - Authentication services
 * - Real-time subscriptions
 * - Environment-based configuration
 * - Error validation
 * 
 * Integration Points:
 * 1. Authentication:
 *    - AuthContext uses client for auth operations
 *    - Session management
 *    - User operations
 * 
 * 2. Database Operations:
 *    - Todo CRUD operations
 *    - Folder management
 *    - User preferences
 *    - Sharing functionality
 * 
 * 3. Real-time Features:
 *    - Todo updates
 *    - Folder changes
 *    - Collaboration events
 * 
 * Environment Variables:
 * - VITE_SUPABASE_URL: Project URL
 * - VITE_SUPABASE_ANON_KEY: Public API key
 * 
 * Security:
 * - Uses environment variables for sensitive data
 * - Implements Row Level Security (RLS)
 * - Public key only (anon key)
 */

import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

/**
 * Strongly-typed Supabase client instance
 * Uses Database type for type-safe queries
 */
export const supabase = createClient<Database>(supabaseUrl, supabaseKey);

/**
 * Usage Examples:
 * 
 * Authentication:
 * ```typescript
 * // Sign in
 * const { data, error } = await supabase.auth.signInWithPassword({
 *   email: 'user@example.com',
 *   password: 'password123'
 * });
 * 
 * // Sign out
 * await supabase.auth.signOut();
 * ```
 * 
 * Database Operations:
 * ```typescript
 * // Insert todo
 * const { data, error } = await supabase
 *   .from('todos')
 *   .insert({ title: 'New Todo', user_id: userId })
 *   .select();
 * 
 * // Real-time subscription
 * const subscription = supabase
 *   .channel('todos')
 *   .on('postgres_changes', { event: '*', schema: 'public' }, callback)
 *   .subscribe();
 * ```
 * 
 * @see {@link AuthContext} For authentication implementation
 * @see {@link useTodos} For todo operations
 * @see {@link useFolders} For folder operations
 */