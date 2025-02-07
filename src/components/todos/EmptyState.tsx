/**
 * EmptyState Component
 * 
 * A presentational component that displays a message when no todos are found in the
 * current view. The message adapts based on the active filter to provide relevant
 * context to the user.
 * 
 * @component
 * 
 * Key Features:
 * - Context-aware messaging based on filter
 * - Visual feedback with icon
 * - Responsive layout
 * - Accessible text structure
 * 
 * Integration Points:
 * 1. Parent Component:
 *    - TodoList renders EmptyState when filtered todos array is empty
 *    - Provides current filter state
 * 
 * 2. Related Components:
 *    - TodoFilter determines which filter is active
 *    - TodoForm allows adding new items
 * 
 * Data Flow:
 * 1. Parent filters todos array
 * 2. If array is empty, EmptyState is rendered
 * 3. Component displays message based on filter prop
 * 
 * Usage Context:
 * - Initial app state (no todos created)
 * - All todos completed (active filter)
 * - No completed todos (completed filter)
 */

import { Clock } from 'lucide-react';

/**
 * Props for EmptyState component
 * @property filter - Current active filter to show appropriate message
 */
interface EmptyStateProps {
  /** The currently active filter determining which message to show */
  filter: 'all' | 'active' | 'completed';
}

export default function EmptyState({ filter }: EmptyStateProps) {
  /**
   * Determines the appropriate message based on the current filter
   */
  const getMessage = () => {
    switch (filter) {
      case 'all':
        return "You haven't created any tasks yet";
      case 'active':
        return 'No active tasks found';
      case 'completed':
        return 'No completed tasks found';
    }
  };

  return (
    <div 
      className="text-center py-12"
      role="status"
      aria-label={`Empty state: ${getMessage()}`}
    >
      <Clock 
        className="h-12 w-12 text-gray-400 mx-auto mb-4" 
        aria-hidden="true"
      />
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        No tasks found
      </h3>
      <p className="text-gray-600">
        {getMessage()}
      </p>
    </div>
  );
}

/**
 * Component Usage Example:
 * 
 * ```tsx
 * import EmptyState from './components/todos/EmptyState';
 * 
 * function TodoList() {
 *   const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
 *   const filteredTodos = todos.filter((todo) => {
 *     if (filter === 'active') return !todo.is_complete;
 *     if (filter === 'completed') return todo.is_complete;
 *     return true;
 *   });
 * 
 *   return (
 *     <div>
 *       {filteredTodos.length === 0 && <EmptyState filter={filter} />}
 *     </div>
 *   );
 * }
 * ```
 * 
 * @see {@link TodoList} For the parent component implementation
 * @see {@link TodoFilter} For the filter controls
 */