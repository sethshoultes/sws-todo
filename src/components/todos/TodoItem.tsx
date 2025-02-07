/**
 * TodoItem Component
 * 
 * A comprehensive todo item component that displays and manages individual todo entries.
 * Supports drag-and-drop reordering, completion toggling, editing, and deletion with
 * a rich, interactive interface.
 * 
 * @component
 * 
 * Key Features:
 * - Drag and drop reordering
 * - Completion status toggle
 * - Edit and delete actions
 * - Bulk selection support
 * - Creation date display
 * - Responsive layout
 * - Accessible controls
 * 
 * Integration Points:
 * 1. Database:
 *    - Updates todo status in Supabase
 *    - Handles todo deletion
 *    - Maintains order preferences
 * 
 * 2. Parent Component:
 *    - TodoList manages todo state
 *    - Handles drag-drop reordering
 *    - Controls bulk selection mode
 * 
 * 3. Related Components:
 *    - EditTodoModal for editing
 *    - BulkActionsBar for multi-select
 *    - FolderList for organization
 * 
 * Data Flow:
 * 1. Display:
 *    - Renders todo details
 *    - Shows completion status
 *    - Displays creation time
 * 
 * 2. User Actions:
 *    - Toggle completion
 *    - Edit todo details
 *    - Delete todo
 *    - Drag to reorder
 *    - Bulk selection
 * 
 * 3. State Updates:
 *    - Optimistic UI updates
 *    - Real-time sync
 *    - Error handling
 */

import { Calendar, CheckCircle2, Circle, Edit2, GripVertical, Trash2 } from 'lucide-react';
import { Database } from '../../types/supabase';

type Todo = Database['public']['Tables']['todos']['Row'];

interface TodoItemProps {
  /** The todo item to display */
  todo: Todo;
  /** Whether the todo can be selected for bulk actions */
  isSelectable: boolean;
  /** Whether the todo is currently selected */
  isSelected: boolean;
  /** Callback when todo selection changes */
  onSelect: (todo: Todo) => void;
  /** Callback to toggle completion status */
  onToggle: (todo: Todo) => Promise<void>;
  /** Callback to initiate editing */
  onEdit: (todo: Todo) => void;
  /** Callback to delete todo */
  onDelete: (id: string) => Promise<void>;
  /** Callback when drag starts */
  onDragStart: (todo: Todo) => void;
  /** Callback when drag ends */
  onDragEnd: () => void;
  /** Callback when todo is dropped */
  onDrop: (targetTodo: Todo) => void;
}

/**
 * Formats a date string into a localized, human-readable format
 * @param date - ISO date string
 * @returns Formatted date string (e.g., "Jan 1, 12:00 PM")
 */
const formatDate = (date: string) => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  }).format(new Date(date));
};

export default function TodoItem({ 
  todo, 
  isSelectable,
  isSelected,
  onSelect,
  onToggle, 
  onEdit, 
  onDelete,
  onDragStart,
  onDragEnd,
  onDrop,
}: TodoItemProps) {
  /**
   * Handles the start of a drag operation
   * @param e - Drag event
   */
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.effectAllowed = 'move';
    onDragStart(todo);
  };

  /**
   * Handles dragover event for drop target
   * @param e - Drag event
   */
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.classList.add('bg-indigo-50');
  };

  /**
   * Handles drag leave event for drop target
   * @param e - Drag event
   */
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.classList.remove('bg-indigo-50');
  };

  /**
   * Handles drop event for reordering
   * @param e - Drop event
   */
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.classList.remove('bg-indigo-50');
    onDrop(todo);
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={onDragEnd}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`bg-white p-4 rounded-lg shadow-sm border-l-4 relative ${
        todo.is_complete ? 'border-green-500' : 'border-indigo-500'
      } hover:shadow-md transition-all duration-200 cursor-move`}
      role="listitem"
      aria-label={`Todo: ${todo.title}`}
    >
      <div className="flex flex-col sm:flex-row items-start gap-4">
        <div className="flex items-start space-x-2 flex-grow min-w-0">
          {isSelectable && (
            <div 
              className="mt-1.5 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                onSelect(todo);
              }}
              role="checkbox"
              aria-checked={isSelected}
              tabIndex={0}
            >
              <div
                className={`w-5 h-5 rounded-md border-2 ${
                  isSelected
                    ? 'bg-indigo-600 border-indigo-600'
                    : 'border-gray-300'
                } transition-colors duration-200`}
              >
                {isSelected && (
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </div>
            </div>
          )}
          <button
            className="mt-1.5 text-gray-400 hover:text-gray-600 transition-colors cursor-grab active:cursor-grabbing"
            aria-label="Drag to reorder"
          >
            <GripVertical className="h-5 w-5" aria-hidden="true" />
          </button>
          <button
            onClick={() => onToggle(todo)}
            className="mt-1 text-gray-400 hover:text-indigo-600 transition-colors"
            aria-label={todo.is_complete ? 'Mark as incomplete' : 'Mark as complete'}
          >
            {todo.is_complete ? (
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            ) : (
              <Circle className="h-5 w-5" />
            )}
          </button>
          <div>
            <h3
              className={`text-lg font-medium ${
                todo.is_complete ? 'line-through text-gray-500' : ''
              }`}
            >
              {todo.title}
            </h3>
            {todo.description && (
              <p className="text-gray-600 mt-1 text-sm">{todo.description}</p>
            )}
            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
              <Calendar className="h-4 w-4" aria-hidden="true" />
              <span>{formatDate(todo.created_at)}</span>
            </div>
          </div>
        </div>
        <div className="flex space-x-2 sm:ml-4 mt-2 sm:mt-0">
          <button
            onClick={() => onEdit(todo)}
            className="text-gray-400 hover:text-indigo-600 transition-colors"
            aria-label="Edit todo"
          >
            <Edit2 className="h-5 w-5" />
          </button>
          <button
            onClick={() => onDelete(todo.id)}
            className="text-gray-400 hover:text-red-600 transition-colors"
            aria-label="Delete todo"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Component Usage Example:
 * 
 * ```tsx
 * import TodoItem from './components/todos/TodoItem';
 * import { useTodos } from '../../hooks/useTodos';
 * import { useDragAndDrop } from '../../hooks/useDragAndDrop';
 * 
 * function TodoList() {
 *   const { toggleTodo, deleteTodo } = useTodos();
 *   const { handleDragStart, handleDragEnd, handleDrop } = useDragAndDrop();
 *   const [selectedTodos, setSelectedTodos] = useState(new Set<string>());
 * 
 *   return (
 *     <TodoItem
 *       todo={todo}
 *       isSelectable={true}
 *       isSelected={selectedTodos.has(todo.id)}
 *       onSelect={(todo) => {
 *         setSelectedTodos(prev => {
 *           const next = new Set(prev);
 *           if (next.has(todo.id)) {
 *             next.delete(todo.id);
 *           } else {
 *             next.add(todo.id);
 *           }
 *           return next;
 *         });
 *       }}
 *       onToggle={toggleTodo}
 *       onEdit={setEditingTodo}
 *       onDelete={deleteTodo}
 *       onDragStart={handleDragStart}
 *       onDragEnd={handleDragEnd}
 *       onDrop={handleDrop}
 *     />
 *   );
 * }
 * ```
 * 
 * @see {@link useTodos} For todo management hook
 * @see {@link useDragAndDrop} For drag and drop functionality
 * @see {@link TodoList} For parent component implementation
 * @see {@link EditTodoModal} For todo editing interface
 */