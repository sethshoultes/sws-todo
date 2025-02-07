/**
 * TodoFilter Component
 * 
 * A filter control component that allows users to switch between different views
 * of their todo items. Provides three filter states:
 * - Active: Shows only incomplete todos
 * - All: Shows all todos regardless of status
 * - Completed: Shows only completed todos
 * 
 * @component
 * 
 * Integration Points:
 * 1. Parent Component:
 *    - TodoList manages filter state
 *    - Applies filtering logic based on selected state
 * 
 * 2. Related Components:
 *    - EmptyState shows messages based on current filter
 *    - TodoItem visibility depends on filter state
 * 
 * Data Flow:
 * 1. User selects filter option
 * 2. Parent updates filter state
 * 3. TodoList filters todos array
 * 4. UI updates to show filtered items
 * 
 * Features:
 * - Visual indication of active filter
 * - Responsive button layout
 * - Hover effects
 * - Accessible buttons
 */

/**
 * Props for TodoFilter component
 * @property filter - Current active filter
 * @property onFilterChange - Callback to change the filter
 */
interface TodoFilterProps {
  filter: 'active' | 'all' | 'completed';
  onFilterChange: (filter: 'active' | 'all' | 'completed') => void;
}

export default function TodoFilter({ filter, onFilterChange }: TodoFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onFilterChange('active')}
        className={`px-3 py-1.5 text-sm sm:px-4 sm:py-2 rounded-md ${
          filter === 'active'
            ? 'bg-indigo-600 text-white'
            : 'bg-white text-gray-600 hover:bg-gray-50'
        }`}
        aria-pressed={filter === 'active'}
        aria-label="Show active tasks"
      >
        Active
      </button>
      <button
        onClick={() => onFilterChange('all')}
        className={`px-3 py-1.5 text-sm sm:px-4 sm:py-2 rounded-md ${
          filter === 'all'
            ? 'bg-indigo-600 text-white'
            : 'bg-white text-gray-600 hover:bg-gray-50'
        }`}
        aria-pressed={filter === 'all'}
        aria-label="Show all tasks"
      >
        All
      </button>
      <button
        onClick={() => onFilterChange('completed')}
        className={`px-3 py-1.5 text-sm sm:px-4 sm:py-2 rounded-md ${
          filter === 'completed'
            ? 'bg-indigo-600 text-white'
            : 'bg-white text-gray-600 hover:bg-gray-50'
        }`}
        aria-pressed={filter === 'completed'}
        aria-label="Show completed tasks"
      >
        Completed
      </button>
    </div>
  );
}

/**
 * Component Usage Example:
 * 
 * ```tsx
 * import TodoFilter from './components/todos/TodoFilter';
 * 
 * function TodoList() {
 *   const [filter, setFilter] = useState<'active' | 'all' | 'completed'>('active');
 *   
 *   const filteredTodos = todos.filter((todo) => {
 *     if (filter === 'active') return !todo.is_complete;
 *     if (filter === 'completed') return todo.is_complete;
 *     return true;
 *   });
 * 
 *   return (
 *     <TodoFilter
 *       filter={filter}
 *       onFilterChange={setFilter}
 *     />
 *   );
 * }
 * ```
 * 
 * @see {@link TodoList} For the parent component implementation
 * @see {@link EmptyState} For empty state handling based on filter
 */